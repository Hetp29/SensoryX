# backend/app/routers/doctors.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.services import doctor_service

router = APIRouter()


class BookingRequest(BaseModel):
    user_id: str
    doctor_id: str
    date: str  # YYYY-MM-DD
    time: str  # e.g., "9:00 AM"
    appointment_type: Optional[str] = "In-Person"  # "In-Person", "Video Call", "Phone Consultation"
    patient_data: Optional[Dict] = None
    insurance_info: Optional[Dict] = None


@router.get("/search")
async def search_doctors(
    location: str = Query(..., description="City, state (e.g., 'Boston, MA')"),
    specialty: Optional[str] = Query(None, description="Medical specialty"),
    insurance: Optional[str] = Query(None, description="Insurance provider"),
    max_distance: Optional[float] = Query(None, description="Maximum distance in miles"),
    max_cost: Optional[float] = Query(None, description="Maximum consultation cost"),
    availability: Optional[str] = Query(None, description="Availability level: high, medium, low"),
    sort_by: str = Query("distance", description="Sort by: distance, cost, rating, availability")
):
    """
    Search for doctors based on various criteria

    This endpoint allows filtering and sorting doctors by:
    - Location and distance
    - Specialty (e.g., "Neurology", "Family Medicine")
    - Insurance acceptance
    - Cost range
    - Availability

    Returns a list of matching doctors with their details.
    """
    try:
        doctors = await doctor_service.search_doctors(
            location=location,
            specialty=specialty,
            insurance=insurance,
            max_distance=max_distance,
            max_cost=max_cost,
            availability=availability,
            sort_by=sort_by
        )

        return {
            "success": True,
            "count": len(doctors),
            "data": doctors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doctor_id}")
async def get_doctor_details(doctor_id: str):
    """
    Get detailed information about a specific doctor

    Returns:
    - Full profile
    - Education and experience
    - Accepted insurance
    - Patient reviews
    - Available appointment types
    """
    try:
        doctor = await doctor_service.get_doctor_details(doctor_id)

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        return {
            "success": True,
            "data": doctor
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doctor_id}/availability")
async def get_doctor_availability(
    doctor_id: str,
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (default: next 7 days)")
):
    """
    Get available appointment slots for a doctor

    Returns available time slots for the next 7 days (or from specified date).
    Each slot includes:
    - Date and time
    - Appointment type
    - Duration
    - Availability status
    """
    try:
        slots = await doctor_service.get_available_slots(
            doctor_id=doctor_id,
            date=date
        )

        if not slots:
            raise HTTPException(status_code=404, detail="Doctor not found or no availability")

        return {
            "success": True,
            "doctor_id": doctor_id,
            "slots": slots,
            "total_slots": len(slots),
            "available_slots": len([s for s in slots if s.get("available")])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/book")
async def book_appointment(request: BookingRequest):
    """
    Book an appointment with a doctor

    Request body should include:
    - user_id: Your user ID
    - doctor_id: Doctor's ID
    - date: Appointment date (YYYY-MM-DD)
    - time: Appointment time (e.g., "9:00 AM")
    - appointment_type: "In-Person", "Video Call", or "Phone Consultation"
    - patient_data: Optional patient information
    - insurance_info: Optional insurance information

    Returns:
    - Booking confirmation
    - Appointment details
    - Cost breakdown (including insurance coverage if applicable)
    """
    try:
        booking = await doctor_service.book_appointment(
            user_id=request.user_id,
            doctor_id=request.doctor_id,
            date=request.date,
            time=request.time,
            appointment_type=request.appointment_type,
            patient_data=request.patient_data,
            insurance_info=request.insurance_info
        )

        if "error" in booking:
            raise HTTPException(status_code=400, detail=booking["error"])

        return {
            "success": True,
            "data": booking
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/specialties/list")
async def get_specialties():
    """
    Get list of available medical specialties

    Returns all medical specialties available for search filtering.
    """
    specialties = [
        "General Practitioner",
        "Internal Medicine",
        "Family Medicine",
        "Neurology",
        "Cardiology",
        "Dermatology",
        "Pediatrics",
        "Psychiatry",
        "Orthopedics",
        "Urgent Care",
        "Emergency Medicine",
        "OB/GYN"
    ]

    return {
        "success": True,
        "data": specialties
    }
