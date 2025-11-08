# backend/app/populate_data.py
import asyncio
from services.vector_service import upsert_symptom_vector
import uuid

async def populate_pinecone():
    """Populate with fake symptom data"""
    
    symptoms = [
        {
            "description": "Sharp stabbing pain behind left eye when swallowing",
            "condition": "Occipital Neuralgia",
            "treatment": "Nerve block injection",
            "success_rate": 0.89
        },
        {
            "description": "Throbbing pressure in temples that worsens with light",
            "condition": "Migraine",
            "treatment": "Triptans medication",
            "success_rate": 0.78
        },
        {
            "description": "Burning sensation in chest after eating",
            "condition": "GERD",
            "treatment": "Proton pump inhibitors",
            "success_rate": 0.82
        },
        {
            "description": "Tingling numbness spreading from pinky to elbow",
            "condition": "Ulnar Nerve Entrapment",
            "treatment": "Physical therapy and ergonomic adjustment",
            "success_rate": 0.71
        },
        {
            "description": "Electric shock feeling down spine when bending neck",
            "condition": "Lhermitte's Sign",
            "treatment": "MRI evaluation and neurological consultation",
            "success_rate": 0.65
        },
        {
            "description": "Crawling sensation under skin at night",
            "condition": "Restless Leg Syndrome",
            "treatment": "Iron supplementation and dopamine agonists",
            "success_rate": 0.73
        },
        {
            "description": "Metallic taste in mouth with jaw pain",
            "condition": "TMJ Disorder",
            "treatment": "Mouth guard and jaw exercises",
            "success_rate": 0.80
        },
        {
            "description": "Phantom vibrations in thigh pocket area",
            "condition": "Phantom Vibration Syndrome",
            "treatment": "Digital detox and mindfulness therapy",
            "success_rate": 0.91
        },
        {
            "description": "Ice pick headache lasting 3 seconds",
            "condition": "Primary Stabbing Headache",
            "treatment": "Indomethacin medication",
            "success_rate": 0.84
        },
        {
            "description": "Whooshing sound in ear synchronized with heartbeat",
            "condition": "Pulsatile Tinnitus",
            "treatment": "Vascular imaging and targeted treatment",
            "success_rate": 0.68
        },
        {
            "description": "Sudden feeling of warm water running down leg",
            "condition": "Paresthesia",
            "treatment": "B12 supplementation and nerve conduction study",
            "success_rate": 0.75
        },
        {
            "description": "Painful clicking in throat when swallowing",
            "condition": "Eagle Syndrome",
            "treatment": "Surgical styloidectomy",
            "success_rate": 0.88
        },
        {
            "description": "Feeling of insects crawling in ear canal",
            "condition": "Formication",
            "treatment": "ENT examination and anxiety management",
            "success_rate": 0.77
        },
        {
            "description": "Sharp needle pain in big toe at night",
            "condition": "Gout",
            "treatment": "Colchicine and dietary changes",
            "success_rate": 0.85
        },
        {
            "description": "Sensation of heart skipping beats followed by hard thump",
            "condition": "Premature Ventricular Contractions",
            "treatment": "Beta blockers and stress reduction",
            "success_rate": 0.79
        },
        {
            "description": "Burning feet that feels better when walking",
            "condition": "Small Fiber Neuropathy",
            "treatment": "Gabapentin and alpha-lipoic acid",
            "success_rate": 0.62
        },
        {
            "description": "Pressure behind eyes when looking at screens",
            "condition": "Digital Eye Strain",
            "treatment": "20-20-20 rule and blue light filters",
            "success_rate": 0.93
        },
        {
            "description": "Stabbing pain under ribs when breathing deeply",
            "condition": "Precordial Catch Syndrome",
            "treatment": "Breathing exercises and reassurance",
            "success_rate": 0.95
        },
        {
            "description": "Feeling of throat closing when lying down",
            "condition": "Laryngopharyngeal Reflux",
            "treatment": "Elevated sleep position and PPIs",
            "success_rate": 0.76
        },
        {
            "description": "Sudden electric zap in brain when falling asleep",
            "condition": "Hypnic Jerk",
            "treatment": "Sleep hygiene and magnesium",
            "success_rate": 0.81
        },
        {
            "description": "Painful pop in jaw followed by inability to close mouth",
            "condition": "TMJ Dislocation",
            "treatment": "Manual reduction and muscle relaxants",
            "success_rate": 0.90
        },
        {
            "description": "Feeling of water trapped in ear after no water exposure",
            "condition": "Eustachian Tube Dysfunction",
            "treatment": "Nasal steroids and Valsalva maneuver",
            "success_rate": 0.72
        },
        {
            "description": "Sudden smell of burnt toast with no source",
            "condition": "Phantosmia",
            "treatment": "Neurological evaluation and nasal saline rinses",
            "success_rate": 0.64
        },
        {
            "description": "Fingers turn white then blue in cold",
            "condition": "Raynaud's Phenomenon",
            "treatment": "Calcium channel blockers and hand warmers",
            "success_rate": 0.83
        },
        {
            "description": "Feeling of sand or grit in eyes upon waking",
            "condition": "Dry Eye Syndrome",
            "treatment": "Artificial tears and warm compresses",
            "success_rate": 0.87
        }
    ]
    
    for i, symptom in enumerate(symptoms):
        symptom_id = f"symptom_{i:03d}"
        await upsert_symptom_vector(
            symptom_id=symptom_id,
            description=symptom["description"],
            metadata=symptom
        )
        print(f"Added: {symptom['description'][:50]}...")
    
    print(f"✅ Populated {len(symptoms)} symptoms")

if __name__ == "__main__":
    asyncio.run(populate_pinecone())