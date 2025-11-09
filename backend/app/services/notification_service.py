# backend/app/services/notification_service.py
"""
Smart Health Notifications Service

Intelligent notification system for:
- Medication reminders
- Appointment reminders
- Symptom check-ins
- Outbreak alerts
- Follow-up care reminders
- AI consultation follow-ups

Track: Amazon Practical AI (Practical health reminders)
Track: ElevenLabs MLH (Voice notifications)
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum
import json


class NotificationType(str, Enum):
    MEDICATION_REMINDER = "medication_reminder"
    APPOINTMENT_REMINDER = "appointment_reminder"
    SYMPTOM_CHECKIN = "symptom_checkin"
    OUTBREAK_ALERT = "outbreak_alert"
    FOLLOWUP_CARE = "followup_care"
    AI_CONSULTATION_FOLLOWUP = "ai_consultation_followup"
    TREATMENT_PROGRESS = "treatment_progress"
    HEALTH_TIP = "health_tip"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationChannel(str, Enum):
    PUSH = "push"
    SMS = "sms"
    EMAIL = "email"
    VOICE = "voice"  # ElevenLabs integration
    IN_APP = "in_app"


class Notification:
    """Smart notification with AI-powered timing and personalization"""

    def __init__(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        channels: List[NotificationChannel] = None,
        scheduled_time: Optional[datetime] = None,
        metadata: Optional[Dict] = None
    ):
        self.notification_id = f"notif_{datetime.now().timestamp()}"
        self.user_id = user_id
        self.notification_type = notification_type
        self.title = title
        self.message = message
        self.priority = priority
        self.channels = channels or [NotificationChannel.IN_APP]
        self.scheduled_time = scheduled_time or datetime.now()
        self.metadata = metadata or {}
        self.created_at = datetime.now()
        self.sent_at = None
        self.read_at = None
        self.status = "scheduled"  # scheduled, sent, read, dismissed, failed


# In-memory notification store (replace with Redis/DB in production)
notifications_store: Dict[str, List[Notification]] = {}
notification_preferences: Dict[str, Dict] = {}


async def create_notification(
    user_id: str,
    notification_type: NotificationType,
    title: str,
    message: str,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    channels: List[NotificationChannel] = None,
    scheduled_time: Optional[datetime] = None,
    metadata: Optional[Dict] = None
) -> Dict:
    """
    Create a smart health notification

    Track: Amazon Practical AI
    """
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        channels=channels,
        scheduled_time=scheduled_time,
        metadata=metadata
    )

    # Store notification
    if user_id not in notifications_store:
        notifications_store[user_id] = []
    notifications_store[user_id].append(notification)

    # Check if should send immediately
    if scheduled_time is None or scheduled_time <= datetime.now():
        await _send_notification(notification)

    return {
        "notification_id": notification.notification_id,
        "user_id": user_id,
        "type": notification_type.value,
        "title": title,
        "scheduled_time": notification.scheduled_time.isoformat(),
        "status": notification.status,
        "channels": [c.value for c in notification.channels],
        "priority": priority.value
    }


async def create_medication_reminder(
    user_id: str,
    medication_name: str,
    dosage: str,
    time: str,
    frequency: str = "daily",
    voice_enabled: bool = False
) -> Dict:
    """
    Create medication reminder notification

    Track: Amazon Practical AI + ElevenLabs (if voice enabled)
    """
    channels = [NotificationChannel.IN_APP, NotificationChannel.PUSH]
    if voice_enabled:
        channels.append(NotificationChannel.VOICE)

    title = f"Time for {medication_name}"
    message = f"Take {dosage} of {medication_name}. Frequency: {frequency}"

    return await create_notification(
        user_id=user_id,
        notification_type=NotificationType.MEDICATION_REMINDER,
        title=title,
        message=message,
        priority=NotificationPriority.HIGH,
        channels=channels,
        metadata={
            "medication_name": medication_name,
            "dosage": dosage,
            "frequency": frequency,
            "time": time,
            "voice_enabled": voice_enabled
        }
    )


async def create_appointment_reminder(
    user_id: str,
    appointment_id: str,
    doctor_name: str,
    appointment_time: datetime,
    location: str,
    reminder_hours_before: int = 24
) -> Dict:
    """
    Create appointment reminder notification

    Track: Amazon Practical AI
    """
    reminder_time = appointment_time - timedelta(hours=reminder_hours_before)

    title = f"Appointment Reminder: Dr. {doctor_name}"
    message = f"You have an appointment with Dr. {doctor_name} at {appointment_time.strftime('%I:%M %p on %B %d')}. Location: {location}"

    return await create_notification(
        user_id=user_id,
        notification_type=NotificationType.APPOINTMENT_REMINDER,
        title=title,
        message=message,
        priority=NotificationPriority.MEDIUM,
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.EMAIL],
        scheduled_time=reminder_time,
        metadata={
            "appointment_id": appointment_id,
            "doctor_name": doctor_name,
            "appointment_time": appointment_time.isoformat(),
            "location": location
        }
    )


async def create_symptom_checkin(
    user_id: str,
    condition: str,
    last_checkin_days_ago: int = 0
) -> Dict:
    """
    Create symptom check-in notification

    Smart AI-powered reminder to track symptom progress

    Track: Amazon Practical AI
    """
    title = f"How are your {condition} symptoms?"
    message = f"It's been a while since your last check-in. Let us know how you're feeling so we can track your progress."

    if last_checkin_days_ago > 7:
        priority = NotificationPriority.HIGH
    else:
        priority = NotificationPriority.MEDIUM

    return await create_notification(
        user_id=user_id,
        notification_type=NotificationType.SYMPTOM_CHECKIN,
        title=title,
        message=message,
        priority=priority,
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH],
        metadata={
            "condition": condition,
            "last_checkin_days_ago": last_checkin_days_ago
        }
    )


async def create_outbreak_alert(
    user_id: str,
    condition: str,
    location: str,
    severity: str,
    case_count: int,
    recommendations: List[str]
) -> Dict:
    """
    Create outbreak alert notification

    Real-time alerts for disease outbreaks in user's area

    Track: Amazon Practical AI
    """
    title = f"⚠️ {condition} Alert in {location}"
    message = f"{condition} cases are up in {location} ({case_count} active cases - {severity} severity). Stay safe and follow health guidelines."

    priority = NotificationPriority.HIGH if severity in ["moderate", "high"] else NotificationPriority.MEDIUM

    return await create_notification(
        user_id=user_id,
        notification_type=NotificationType.OUTBREAK_ALERT,
        title=title,
        message=message,
        priority=priority,
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH],
        metadata={
            "condition": condition,
            "location": location,
            "severity": severity,
            "case_count": case_count,
            "recommendations": recommendations
        }
    )


async def create_followup_reminder(
    user_id: str,
    condition: str,
    treatment_started: datetime,
    expected_improvement_days: int = 7
) -> Dict:
    """
    Create follow-up care reminder

    Track: Amazon Practical AI
    """
    followup_time = treatment_started + timedelta(days=expected_improvement_days)

    title = f"Follow-up: {condition} Treatment"
    message = f"It's been {expected_improvement_days} days since starting treatment for {condition}. How are you feeling? Let us know if symptoms haven't improved."

    return await create_notification(
        user_id=user_id,
        notification_type=NotificationType.FOLLOWUP_CARE,
        title=title,
        message=message,
        priority=NotificationPriority.MEDIUM,
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH],
        scheduled_time=followup_time,
        metadata={
            "condition": condition,
            "treatment_started": treatment_started.isoformat(),
            "expected_improvement_days": expected_improvement_days
        }
    )


async def create_ai_consultation_followup(
    user_id: str,
    session_id: str,
    diagnosis: str,
    days_after: int = 3
) -> Dict:
    """
    Create AI consultation follow-up

    Track: Amazon Practical AI
    """
    followup_time = datetime.now() + timedelta(days=days_after)

    title = "How are you feeling?"
    message = f"Following up on your recent AI consultation about {diagnosis}. Have your symptoms improved? We're here to help if you need anything."

    return await create_notification(
        user_id=user_id,
        notification_type=NotificationType.AI_CONSULTATION_FOLLOWUP,
        title=title,
        message=message,
        priority=NotificationPriority.LOW,
        channels=[NotificationChannel.IN_APP],
        scheduled_time=followup_time,
        metadata={
            "session_id": session_id,
            "diagnosis": diagnosis,
            "days_after": days_after
        }
    )


async def get_user_notifications(
    user_id: str,
    notification_type: Optional[NotificationType] = None,
    status: Optional[str] = None,
    limit: int = 50
) -> Dict:
    """
    Get user's notifications with filters

    Track: Amazon Practical AI
    """
    user_notifications = notifications_store.get(user_id, [])

    # Apply filters
    filtered = user_notifications
    if notification_type:
        filtered = [n for n in filtered if n.notification_type == notification_type]
    if status:
        filtered = [n for n in filtered if n.status == status]

    # Sort by created_at descending
    filtered.sort(key=lambda n: n.created_at, reverse=True)

    # Limit results
    filtered = filtered[:limit]

    return {
        "user_id": user_id,
        "total_notifications": len(filtered),
        "unread_count": len([n for n in user_notifications if n.status in ["scheduled", "sent"]]),
        "notifications": [
            {
                "notification_id": n.notification_id,
                "type": n.notification_type.value,
                "title": n.title,
                "message": n.message,
                "priority": n.priority.value,
                "status": n.status,
                "created_at": n.created_at.isoformat(),
                "scheduled_time": n.scheduled_time.isoformat(),
                "sent_at": n.sent_at.isoformat() if n.sent_at else None,
                "read_at": n.read_at.isoformat() if n.read_at else None,
                "channels": [c.value for c in n.channels],
                "metadata": n.metadata
            }
            for n in filtered
        ]
    }


async def mark_notification_read(user_id: str, notification_id: str) -> Dict:
    """Mark notification as read"""
    user_notifications = notifications_store.get(user_id, [])

    for notif in user_notifications:
        if notif.notification_id == notification_id:
            notif.read_at = datetime.now()
            notif.status = "read"
            return {
                "success": True,
                "notification_id": notification_id,
                "read_at": notif.read_at.isoformat()
            }

    return {"success": False, "error": "Notification not found"}


async def dismiss_notification(user_id: str, notification_id: str) -> Dict:
    """Dismiss notification"""
    user_notifications = notifications_store.get(user_id, [])

    for notif in user_notifications:
        if notif.notification_id == notification_id:
            notif.status = "dismissed"
            return {
                "success": True,
                "notification_id": notification_id,
                "status": "dismissed"
            }

    return {"success": False, "error": "Notification not found"}


async def set_notification_preferences(
    user_id: str,
    preferences: Dict
) -> Dict:
    """
    Set user notification preferences

    Track: Amazon Practical AI
    """
    notification_preferences[user_id] = {
        "medication_reminders": preferences.get("medication_reminders", True),
        "appointment_reminders": preferences.get("appointment_reminders", True),
        "symptom_checkins": preferences.get("symptom_checkins", True),
        "outbreak_alerts": preferences.get("outbreak_alerts", True),
        "followup_reminders": preferences.get("followup_reminders", True),
        "health_tips": preferences.get("health_tips", False),
        "voice_notifications": preferences.get("voice_notifications", False),
        "quiet_hours_start": preferences.get("quiet_hours_start", "22:00"),
        "quiet_hours_end": preferences.get("quiet_hours_end", "08:00"),
        "preferred_channels": preferences.get("preferred_channels", ["in_app", "push"]),
        "updated_at": datetime.now().isoformat()
    }

    return {
        "success": True,
        "user_id": user_id,
        "preferences": notification_preferences[user_id]
    }


async def get_notification_preferences(user_id: str) -> Dict:
    """Get user notification preferences"""
    prefs = notification_preferences.get(user_id, {
        "medication_reminders": True,
        "appointment_reminders": True,
        "symptom_checkins": True,
        "outbreak_alerts": True,
        "followup_reminders": True,
        "health_tips": False,
        "voice_notifications": False,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "08:00",
        "preferred_channels": ["in_app", "push"]
    })

    return {
        "user_id": user_id,
        "preferences": prefs
    }


async def send_bulk_outbreak_alerts(
    condition: str,
    location: str,
    severity: str,
    case_count: int,
    affected_user_ids: List[str]
) -> Dict:
    """
    Send outbreak alerts to multiple users in affected area

    Track: Amazon Practical AI
    """
    sent_count = 0
    failed_count = 0

    recommendations = _get_outbreak_recommendations(condition, severity)

    for user_id in affected_user_ids:
        try:
            await create_outbreak_alert(
                user_id=user_id,
                condition=condition,
                location=location,
                severity=severity,
                case_count=case_count,
                recommendations=recommendations
            )
            sent_count += 1
        except Exception:
            failed_count += 1

    return {
        "success": True,
        "condition": condition,
        "location": location,
        "total_users": len(affected_user_ids),
        "sent_count": sent_count,
        "failed_count": failed_count
    }


# ============================================
# HELPER FUNCTIONS
# ============================================

async def _send_notification(notification: Notification) -> bool:
    """
    Send notification through specified channels

    In production: integrate with Twilio (SMS), SendGrid (Email),
    Firebase (Push), ElevenLabs (Voice)
    """
    notification.sent_at = datetime.now()
    notification.status = "sent"

    # If voice channel enabled, generate voice notification
    if NotificationChannel.VOICE in notification.channels:
        await _send_voice_notification(notification)

    return True


async def _send_voice_notification(notification: Notification) -> bool:
    """
    Send voice notification using ElevenLabs

    Track: ElevenLabs MLH
    """
    from app.services import elevenlabs_service

    # Convert notification to natural speech
    voice_message = f"{notification.title}. {notification.message}"

    try:
        # Generate audio (in production, would call user's phone)
        audio_bytes = await elevenlabs_service.text_to_speech(
            text=voice_message,
            voice_id="21m00Tcm4TlvDq8ikWAM"  # Rachel voice
        )

        notification.metadata["voice_notification_sent"] = True
        notification.metadata["voice_notification_timestamp"] = datetime.now().isoformat()

        return True
    except Exception as e:
        notification.metadata["voice_notification_error"] = str(e)
        return False


def _get_outbreak_recommendations(condition: str, severity: str) -> List[str]:
    """Get outbreak-specific recommendations"""
    recommendations = {
        "Influenza A": [
            "Get flu shot if not vaccinated",
            "Practice good hand hygiene",
            "Avoid crowded places if symptomatic",
            "Stay home if you have fever"
        ],
        "Seasonal Allergies": [
            "Take antihistamines",
            "Keep windows closed",
            "Monitor pollen count",
            "Shower after being outdoors"
        ],
        "COVID-19": [
            "Wear mask in crowded indoor spaces",
            "Get tested if symptomatic",
            "Stay home if positive",
            "Follow CDC guidelines"
        ]
    }

    return recommendations.get(condition, [
        "Monitor your symptoms",
        "Consult healthcare provider if symptoms worsen",
        "Follow local health guidelines"
    ])


async def get_notification_analytics() -> Dict:
    """
    Get notification analytics

    Track: Amazon Practical AI
    """
    total_notifications = sum(len(notifs) for notifs in notifications_store.values())
    total_users = len(notifications_store)

    all_notifications = []
    for notifs in notifications_store.values():
        all_notifications.extend(notifs)

    sent_count = len([n for n in all_notifications if n.status == "sent"])
    read_count = len([n for n in all_notifications if n.status == "read"])
    voice_enabled_count = len([n for n in all_notifications if NotificationChannel.VOICE in n.channels])

    # Type breakdown
    type_counts = {}
    for notif in all_notifications:
        type_name = notif.notification_type.value
        type_counts[type_name] = type_counts.get(type_name, 0) + 1

    return {
        "total_notifications": total_notifications,
        "total_users": total_users,
        "sent_count": sent_count,
        "read_count": read_count,
        "read_rate": round(read_count / sent_count, 2) if sent_count > 0 else 0,
        "voice_enabled_count": voice_enabled_count,
        "notifications_by_type": type_counts,
        "average_per_user": round(total_notifications / total_users, 1) if total_users > 0 else 0,
        "tracks": ["Amazon Practical AI", "ElevenLabs MLH"]
    }
