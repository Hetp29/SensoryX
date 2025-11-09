// frontend/src/lib/api.ts
/**
 * SensoryX Backend API Client
 *
 * Centralized API client for all backend integrations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  return response.json();
}

// ============================================
// SYMPTOM ANALYSIS
// ============================================

export interface PatientData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  medical_history: string;
  medications: string;
  allergies: string;
  surgery_history: string;
  lifestyle: string;
  family_history: string;
  location: string;
}

export interface SymptomAnalysisRequest {
  user_id: string;
  symptoms: string;
  patient_data: PatientData;
  images?: File[];
}

export interface SymptomAnalysisResponse {
  success: boolean;
  analysis_id: string;
  twin: {
    id: string;
    similarity: number;
    age: number;
    gender: string;
    location: string;
    symptom_description: string;
    diagnosis: string;
    timeline: string;
    treatment: string;
    outcome: string;
  };
  conditions: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    icon: string;
  }>;
}

export async function analyzeSymptoms(data: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
  const formData = new FormData();
  formData.append('user_id', data.user_id);
  formData.append('symptoms', data.symptoms);
  formData.append('patient_data', JSON.stringify(data.patient_data));

  if (data.images) {
    data.images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/symptoms/analyze`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<SymptomAnalysisResponse>(response);
}

export async function getAnalysisById(analysisId: string): Promise<SymptomAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/symptoms/analysis/${analysisId}`);
  return handleResponse<SymptomAnalysisResponse>(response);
}

// ============================================
// AI DOCTOR CONSULTATION
// ============================================

export interface StartAIConsultationRequest {
  user_id: string;
  symptom_data: {
    symptoms: string;
    severity: number;
  };
  patient_data?: PatientData;
}

export interface AIConsultationResponse {
  success: boolean;
  session_id: string;
  message: string;
  cost: number;
  tier: string;
}

export async function startAIConsultation(data: StartAIConsultationRequest): Promise<AIConsultationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ai-doctor/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<AIConsultationResponse>(response);
}

export async function continueAIConsultation(sessionId: string, message: string): Promise<AIConsultationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ai-doctor/continue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  return handleResponse<AIConsultationResponse>(response);
}

export async function getAISummary(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/ai-doctor/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  return handleResponse(response);
}

// Voice consultation
export async function sendVoiceQuestion(sessionId: string, audioBlob: Blob) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio', audioBlob, 'voice.wav');

  const response = await fetch(`${API_BASE_URL}/api/ai-doctor/voice-question`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

// ============================================
// HUMAN DOCTOR DISCOVERY
// ============================================

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews_count: number;
  location: string;
  distance_miles: number;
  accepting_patients: boolean;
  consultation_cost: number;
  insurance_accepted: string[];
  next_available: string;
  coordinates: { lat: number; lng: number };
}

export async function searchDoctors(params: {
  location?: string;
  specialty?: string;
  insurance?: string;
  max_distance?: number;
  max_cost?: number;
  availability?: string;
  sort_by?: string;
}): Promise<{ success: boolean; data: { doctors: Doctor[]; total_found: number } }> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });

  const response = await fetch(`${API_BASE_URL}/api/doctors/search?${queryParams}`);
  return handleResponse(response);
}

export async function getDoctorDetails(doctorId: string) {
  const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`);
  return handleResponse(response);
}

export async function bookAppointment(data: {
  user_id: string;
  doctor_id: string;
  date: string;
  time: string;
  appointment_type: string;
  patient_data: PatientData;
  insurance_info?: any;
}) {
  const response = await fetch(`${API_BASE_URL}/api/doctors/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// ============================================
// FINANCIAL ANALYSIS
// ============================================

export async function getSpendingSummary(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/financial/spending-summary/${userId}`);
  return handleResponse(response);
}

export async function getRiskAssessment(data: {
  monthly_income: number;
  existing_medical_debt: number;
  estimated_treatment_cost: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/financial/risk-assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getAIHumanCostComparison(condition?: string, userId?: string) {
  const params = new URLSearchParams();
  if (condition) params.append('condition', condition);
  if (userId) params.append('user_id', userId);

  const response = await fetch(`${API_BASE_URL}/api/financial/ai-vs-human-comparison?${params}`);
  return handleResponse(response);
}

// ============================================
// PREDICTIVE OUTCOMES
// ============================================

export async function predictTreatmentOutcome(data: {
  condition: string;
  treatment: string;
  patient_profile: PatientData;
}) {
  const response = await fetch(`${API_BASE_URL}/api/predictions/treatment-outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function predictDiagnosisTimeline(data: {
  symptoms: string;
  urgency_level: string;
  patient_profile: PatientData;
}) {
  const response = await fetch(`${API_BASE_URL}/api/predictions/diagnosis-timeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function findSymptomTwins(data: {
  symptoms: string;
  patient_profile: PatientData;
  limit?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/predictions/symptom-twins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// ============================================
// PHOTON HYBRID INTELLIGENCE
// ============================================

export async function startHybridConsultation(data: {
  patient_data: PatientData;
  symptoms: string;
  urgency?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/photon/hybrid-consultation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getHybridConsultationStatus(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/photon/hybrid-consultation/${sessionId}/status`);
  return handleResponse(response);
}

export async function sendHybridMessage(data: {
  session_id: string;
  actor: string;
  message: string;
  metadata?: any;
}) {
  const response = await fetch(`${API_BASE_URL}/api/photon/hybrid-consultation/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// ============================================
// REAL-TIME INSIGHTS
// ============================================

export async function getRealtimeDashboard() {
  const response = await fetch(`${API_BASE_URL}/api/insights/dashboard`);
  return handleResponse(response);
}

export async function detectOutbreaks(location?: string, sensitivity?: number) {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  if (sensitivity) params.append('sensitivity', sensitivity.toString());

  const response = await fetch(`${API_BASE_URL}/api/insights/outbreaks/detect?${params}`);
  return handleResponse(response);
}

export async function getGeographicHeatmap(condition?: string, timeframeDays?: number) {
  const params = new URLSearchParams();
  if (condition) params.append('condition', condition);
  if (timeframeDays) params.append('timeframe_days', timeframeDays.toString());

  const response = await fetch(`${API_BASE_URL}/api/insights/heatmap?${params}`);
  return handleResponse(response);
}

export async function getPredictiveForecast(condition: string, location: string, daysAhead?: number) {
  const params = new URLSearchParams({
    condition,
    location,
  });
  if (daysAhead) params.append('days_ahead', daysAhead.toString());

  const response = await fetch(`${API_BASE_URL}/api/insights/forecast?${params}`);
  return handleResponse(response);
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createMedicationReminder(data: {
  user_id: string;
  medication_name: string;
  dosage: string;
  time: string;
  frequency?: string;
  voice_enabled?: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/medication-reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getUserNotifications(userId: string, type?: string, status?: string) {
  const params = new URLSearchParams({ user_id: userId });
  if (type) params.append('notification_type', type);
  if (status) params.append('status', status);

  const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userId}?${params}`);
  return handleResponse(response);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const params = new URLSearchParams({ user_id: userId, notification_id: notificationId });
  const response = await fetch(`${API_BASE_URL}/api/notifications/mark-read?${params}`, {
    method: 'POST',
  });

  return handleResponse(response);
}

export async function setNotificationPreferences(data: {
  user_id: string;
  medication_reminders?: boolean;
  appointment_reminders?: boolean;
  symptom_checkins?: boolean;
  outbreak_alerts?: boolean;
  voice_notifications?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// ============================================
// MULTI-AGENT SYSTEM
// ============================================

export async function runMultiAgentDiagnosis(data: {
  symptoms: string;
  patient_data: PatientData;
  urgency_level: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/agents/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// ============================================
// WEBSOCKET HELPERS
// ============================================

export function createDashboardWebSocket(onMessage: (data: any) => void): WebSocket {
  const ws = new WebSocket(`ws://localhost:8000/api/insights/ws/dashboard`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
}

export function createOutbreakAlertsWebSocket(onMessage: (data: any) => void): WebSocket {
  const ws = new WebSocket(`ws://localhost:8000/api/insights/ws/alerts`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
}
