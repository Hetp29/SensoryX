# backend/app/services/doctor_service.py
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import random

# Mock doctor database (replace with actual DB/API in production)
MOCK_DOCTORS = [
    {
        "id": "dr001",
        "name": "Dr. Sarah Johnson",
        "specialty": "General Practitioner",
        "subspecialties": ["Family Medicine", "Preventive Care"],
        "rating": 4.8,
        "years_experience": 12,
        "education": ["Harvard Medical School", "Johns Hopkins Residency"],
        "address": "123 Medical Center Dr, Boston, MA 02115",
        "phone": "(555) 123-4567",
        "email": "sjohnson@bostonmedical.com",
        "accepts_insurance": ["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare"],
        "languages": ["English", "Spanish"],
        "availability": "high",
        "consultation_cost": 175,
        "next_available": "2025-01-15",
        "distance_miles": 0.5,
        "coordinates": {"lat": 42.3601, "lng": -71.0589}
    },
    {
        "id": "dr002",
        "name": "Dr. Michael Chen",
        "specialty": "Internal Medicine",
        "subspecialties": ["Cardiology", "Diabetes Management"],
        "rating": 4.9,
        "years_experience": 18,
        "education": ["Stanford Medical School", "UCSF Residency"],
        "address": "456 Healthcare Blvd, Boston, MA 02116",
        "phone": "(555) 234-5678",
        "email": "mchen@bostonhealthcare.com",
        "accepts_insurance": ["Aetna", "Blue Cross", "Medicare"],
        "languages": ["English", "Mandarin", "Cantonese"],
        "availability": "medium",
        "consultation_cost": 225,
        "next_available": "2025-01-18",
        "distance_miles": 1.2,
        "coordinates": {"lat": 42.3581, "lng": -71.0636}
    },
    {
        "id": "dr003",
        "name": "Dr. Emily Rodriguez",
        "specialty": "Family Medicine",
        "subspecialties": ["Pediatrics", "Women's Health"],
        "rating": 4.7,
        "years_experience": 8,
        "education": ["Yale Medical School", "Boston Children's Hospital"],
        "address": "789 Wellness Ave, Boston, MA 02118",
        "phone": "(555) 345-6789",
        "email": "erodriguez@wellnessclinic.com",
        "accepts_insurance": ["Blue Cross", "Cigna", "UnitedHealthcare", "Medicaid"],
        "languages": ["English", "Spanish"],
        "availability": "high",
        "consultation_cost": 150,
        "next_available": "2025-01-14",
        "distance_miles": 1.8,
        "coordinates": {"lat": 42.3398, "lng": -71.0756}
    },
    {
        "id": "dr004",
        "name": "Dr. David Kim",
        "specialty": "Neurology",
        "subspecialties": ["Headache Medicine", "Pain Management"],
        "rating": 4.9,
        "years_experience": 15,
        "education": ["Columbia Medical School", "Mass General Neurology Fellowship"],
        "address": "321 Brain Center Rd, Boston, MA 02114",
        "phone": "(555) 456-7890",
        "email": "dkim@neurologyboston.com",
        "accepts_insurance": ["Aetna", "Blue Cross", "Harvard Pilgrim"],
        "languages": ["English", "Korean"],
        "availability": "low",
        "consultation_cost": 300,
        "next_available": "2025-01-25",
        "distance_miles": 2.1,
        "coordinates": {"lat": 42.3632, "lng": -71.0682}
    },
    {
        "id": "dr005",
        "name": "Dr. Jennifer Williams",
        "specialty": "Urgent Care",
        "subspecialties": ["Emergency Medicine", "Trauma Care"],
        "rating": 4.6,
        "years_experience": 10,
        "education": ["University of Pennsylvania", "Boston Medical Center ER"],
        "address": "555 Emergency Way, Boston, MA 02120",
        "phone": "(555) 567-8901",
        "email": "jwilliams@urgentcare.com",
        "accepts_insurance": ["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare", "Medicare"],
        "languages": ["English"],
        "availability": "high",
        "consultation_cost": 125,
        "next_available": "2025-01-13",
        "distance_miles": 0.8,
        "coordinates": {"lat": 42.3299, "lng": -71.0833}
    }
]


async def search_doctors(
    location: str,
    specialty: Optional[str] = None,
    insurance: Optional[str] = None,
    max_distance: Optional[float] = None,
    max_cost: Optional[float] = None,
    availability: Optional[str] = None,
    sort_by: str = "distance"
) -> List[Dict]:
    """
    Search for doctors based on criteria

    Args:
        location: City, state (e.g., "Boston, MA")
        specialty: Medical specialty filter
        insurance: Insurance provider
        max_distance: Maximum distance in miles
        max_cost: Maximum consultation cost
        availability: "high", "medium", "low"
        sort_by: "distance", "cost", "rating", "availability"
    """
    # In production, this would query a real database or API
    # For now, return filtered mock data

    results = MOCK_DOCTORS.copy()

    # Filter by specialty
    if specialty:
        specialty_lower = specialty.lower()
        results = [
            doc for doc in results
            if specialty_lower in doc["specialty"].lower() or
               any(specialty_lower in sub.lower() for sub in doc["subspecialties"])
        ]

    # Filter by insurance
    if insurance:
        results = [
            doc for doc in results
            if insurance in doc["accepts_insurance"]
        ]

    # Filter by max distance
    if max_distance:
        results = [
            doc for doc in results
            if doc["distance_miles"] <= max_distance
        ]

    # Filter by max cost
    if max_cost:
        results = [
            doc for doc in results
            if doc["consultation_cost"] <= max_cost
        ]

    # Filter by availability
    if availability:
        results = [
            doc for doc in results
            if doc["availability"] == availability
        ]

    # Sort results
    if sort_by == "distance":
        results.sort(key=lambda x: x["distance_miles"])
    elif sort_by == "cost":
        results.sort(key=lambda x: x["consultation_cost"])
    elif sort_by == "rating":
        results.sort(key=lambda x: x["rating"], reverse=True)
    elif sort_by == "availability":
        availability_order = {"high": 0, "medium": 1, "low": 2}
        results.sort(key=lambda x: availability_order.get(x["availability"], 3))

    return results


async def get_doctor_details(doctor_id: str) -> Optional[Dict]:
    """
    Get detailed information about a specific doctor
    """
    for doctor in MOCK_DOCTORS:
        if doctor["id"] == doctor_id:
            # Add additional details
            detailed_info = doctor.copy()
            detailed_info["about"] = _generate_doctor_bio(doctor)
            detailed_info["patient_reviews_count"] = random.randint(50, 500)
            detailed_info["appointment_types"] = [
                {"type": "In-Person", "duration": "30 min", "cost": doctor["consultation_cost"]},
                {"type": "Video Call", "duration": "20 min", "cost": doctor["consultation_cost"] - 25},
                {"type": "Phone Consultation", "duration": "15 min", "cost": doctor["consultation_cost"] - 50}
            ]
            return detailed_info

    return None


async def get_available_slots(
    doctor_id: str,
    date: Optional[str] = None
) -> List[Dict]:
    """
    Get available appointment slots for a doctor

    Args:
        doctor_id: Doctor's ID
        date: Date in YYYY-MM-DD format (default: next 7 days)
    """
    doctor = await get_doctor_details(doctor_id)
    if not doctor:
        return []

    # Generate mock availability
    slots = []
    start_date = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()

    for day_offset in range(7):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        day_name = current_date.strftime("%A")

        # Skip weekends for some doctors
        if current_date.weekday() >= 5 and doctor["availability"] == "low":
            continue

        # Generate time slots based on availability
        if doctor["availability"] == "high":
            time_slots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
        elif doctor["availability"] == "medium":
            time_slots = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]
        else:  # low
            time_slots = ["10:00 AM", "3:00 PM"]

        for time_slot in time_slots:
            slots.append({
                "date": date_str,
                "day": day_name,
                "time": time_slot,
                "available": random.choice([True, True, True, False]),  # 75% available
                "appointment_type": "In-Person",
                "duration": "30 min"
            })

    return slots


async def book_appointment(
    user_id: str,
    doctor_id: str,
    date: str,
    time: str,
    appointment_type: str = "In-Person",
    patient_data: Optional[Dict] = None,
    insurance_info: Optional[Dict] = None
) -> Dict:
    """
    Book an appointment with a doctor

    Returns:
        Booking confirmation with appointment details
    """
    doctor = await get_doctor_details(doctor_id)
    if not doctor:
        return {"error": "Doctor not found"}

    # In production, this would:
    # 1. Check slot availability
    # 2. Reserve the slot
    # 3. Send confirmation emails
    # 4. Create calendar invites
    # 5. Process payment/insurance

    booking_id = f"apt_{datetime.now().timestamp()}"

    # Calculate cost based on appointment type
    appointment_types = {
        "In-Person": doctor["consultation_cost"],
        "Video Call": doctor["consultation_cost"] - 25,
        "Phone Consultation": doctor["consultation_cost"] - 50
    }
    cost = appointment_types.get(appointment_type, doctor["consultation_cost"])

    # Calculate insurance coverage (mock)
    insurance_coverage = 0
    out_of_pocket = cost

    if insurance_info and insurance_info.get("provider") in doctor["accepts_insurance"]:
        # Mock 60-80% coverage
        coverage_percent = random.uniform(0.60, 0.80)
        insurance_coverage = cost * coverage_percent
        out_of_pocket = cost - insurance_coverage

    return {
        "booking_id": booking_id,
        "status": "confirmed",
        "doctor": {
            "id": doctor["id"],
            "name": doctor["name"],
            "specialty": doctor["specialty"],
            "phone": doctor["phone"],
            "address": doctor["address"]
        },
        "appointment": {
            "date": date,
            "time": time,
            "type": appointment_type,
            "duration": "30 min"
        },
        "cost": {
            "total": cost,
            "insurance_coverage": round(insurance_coverage, 2),
            "out_of_pocket": round(out_of_pocket, 2),
            "currency": "USD"
        },
        "confirmation_sent_to": patient_data.get("email", "user@example.com") if patient_data else "user@example.com",
        "booking_timestamp": datetime.now().isoformat()
    }


def _generate_doctor_bio(doctor: Dict) -> str:
    """
    Generate a bio for the doctor
    """
    years = doctor["years_experience"]
    specialty = doctor["specialty"]

    bios = {
        "General Practitioner": f"Dr. {doctor['name'].split()[-1]} is a board-certified {specialty} with {years} years of experience providing comprehensive primary care. Known for a patient-centered approach and commitment to preventive medicine.",
        "Internal Medicine": f"With {years} years of experience, Dr. {doctor['name'].split()[-1]} specializes in {specialty}, focusing on adult health and complex medical conditions. Recognized for evidence-based practice and personalized treatment plans.",
        "Family Medicine": f"Dr. {doctor['name'].split()[-1]} provides compassionate family healthcare for patients of all ages. With {years} years of experience, offers comprehensive care from pediatrics to geriatrics.",
        "Neurology": f"Board-certified neurologist with {years} years specializing in brain and nervous system disorders. Dr. {doctor['name'].split()[-1]} uses cutting-edge diagnostic techniques and personalized treatment approaches.",
        "Urgent Care": f"Dr. {doctor['name'].split()[-1]} brings {years} years of emergency medicine experience to urgent care. Specializes in rapid diagnosis and treatment of acute conditions."
    }

    return bios.get(specialty, f"Experienced {specialty} physician with {years} years of practice.")
