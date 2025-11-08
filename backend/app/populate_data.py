# backend/app/populate_data.py
import asyncio
from app.services.vector_service import upsert_symptom_vector
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
        },
        # Cardiovascular symptoms
        {
            "description": "Racing heart that starts suddenly and stops suddenly",
            "condition": "Supraventricular Tachycardia",
            "treatment": "Vagal maneuvers and catheter ablation",
            "success_rate": 0.88
        },
        {
            "description": "Sharp chest pain that worsens when lying flat",
            "condition": "Pericarditis",
            "treatment": "NSAIDs and colchicine",
            "success_rate": 0.82
        },
        {
            "description": "Leg pain that improves when walking uphill",
            "condition": "Spinal Stenosis",
            "treatment": "Physical therapy and epidural injections",
            "success_rate": 0.71
        },
        # Gastrointestinal symptoms
        {
            "description": "Intense right upper belly pain after fatty meals",
            "condition": "Gallstones",
            "treatment": "Cholecystectomy",
            "success_rate": 0.95
        },
        {
            "description": "Cramping pain relieved immediately after bowel movement",
            "condition": "Irritable Bowel Syndrome",
            "treatment": "Low FODMAP diet and probiotics",
            "success_rate": 0.68
        },
        {
            "description": "Bloody diarrhea with mucus lasting weeks",
            "condition": "Ulcerative Colitis",
            "treatment": "Mesalamine and immunosuppressants",
            "success_rate": 0.74
        },
        # Respiratory symptoms
        {
            "description": "Wheezing and chest tightness worse at 4 AM",
            "condition": "Nocturnal Asthma",
            "treatment": "Long-acting bronchodilators and inhaled steroids",
            "success_rate": 0.84
        },
        {
            "description": "Dry cough lasting 8+ weeks after cold",
            "condition": "Post-Viral Cough Syndrome",
            "treatment": "Inhaled ipratropium and cough suppressants",
            "success_rate": 0.79
        },
        {
            "description": "Coughing up rust-colored sputum with fever",
            "condition": "Pneumonia",
            "treatment": "Antibiotics and supportive care",
            "success_rate": 0.91
        },
        # Dermatological symptoms
        {
            "description": "Intensely itchy rash in skin folds that cracks",
            "condition": "Eczema",
            "treatment": "Topical steroids and moisturizers",
            "success_rate": 0.86
        },
        {
            "description": "Silver scaly patches on elbows and knees",
            "condition": "Psoriasis",
            "treatment": "Biologics and phototherapy",
            "success_rate": 0.77
        },
        {
            "description": "Ring-shaped red rash that expands outward",
            "condition": "Lyme Disease",
            "treatment": "Doxycycline antibiotic course",
            "success_rate": 0.93
        },
        # Musculoskeletal symptoms
        {
            "description": "Morning stiffness in hands lasting over an hour",
            "condition": "Rheumatoid Arthritis",
            "treatment": "Methotrexate and biologics",
            "success_rate": 0.73
        },
        {
            "description": "Pain and swelling in one big toe joint",
            "condition": "Gout Flare",
            "treatment": "Colchicine and uric acid lowering therapy",
            "success_rate": 0.89
        },
        {
            "description": "Shooting pain down leg when lifting straight leg",
            "condition": "Sciatica from Herniated Disc",
            "treatment": "Epidural steroid injections and physical therapy",
            "success_rate": 0.76
        },
        # Neurological symptoms
        {
            "description": "Temporary vision loss like a curtain closing",
            "condition": "Amaurosis Fugax",
            "treatment": "Antiplatelet therapy and carotid evaluation",
            "success_rate": 0.81
        },
        {
            "description": "Face drooping on one side with slurred speech",
            "condition": "Stroke",
            "treatment": "Emergency tPA and thrombectomy",
            "success_rate": 0.70
        },
        {
            "description": "Zigzag flashing lights before severe headache",
            "condition": "Migraine with Aura",
            "treatment": "Triptans and preventive medications",
            "success_rate": 0.82
        },
        {
            "description": "Extreme sensitivity to touch on one side of face",
            "condition": "Trigeminal Neuralgia",
            "treatment": "Carbamazepine and microvascular decompression",
            "success_rate": 0.78
        },
        {
            "description": "Uncontrollable urge to move legs at rest",
            "condition": "Restless Legs Syndrome",
            "treatment": "Dopamine agonists and iron supplementation",
            "success_rate": 0.75
        },
        # Endocrine symptoms
        {
            "description": "Always hungry and thirsty despite eating constantly",
            "condition": "Diabetes Mellitus",
            "treatment": "Insulin or oral hypoglycemics and diet",
            "success_rate": 0.85
        },
        {
            "description": "Feeling cold all the time with weight gain",
            "condition": "Hypothyroidism",
            "treatment": "Levothyroxine replacement",
            "success_rate": 0.92
        },
        {
            "description": "Anxiety, weight loss, and bulging eyes",
            "condition": "Graves' Disease",
            "treatment": "Methimazole and radioactive iodine",
            "success_rate": 0.84
        },
        # Urinary symptoms
        {
            "description": "Burning pain when urinating with frequent urgency",
            "condition": "Urinary Tract Infection",
            "treatment": "Antibiotics and increased hydration",
            "success_rate": 0.94
        },
        {
            "description": "Blood in urine without pain",
            "condition": "Bladder Cancer",
            "treatment": "Cystoscopy and BCG therapy",
            "success_rate": 0.68
        },
        {
            "description": "Kidney pain radiating to groin in waves",
            "condition": "Kidney Stones",
            "treatment": "Lithotripsy and pain management",
            "success_rate": 0.87
        },
        # Reproductive symptoms
        {
            "description": "Severe pelvic cramping during menstruation",
            "condition": "Endometriosis",
            "treatment": "Hormonal therapy and laparoscopic surgery",
            "success_rate": 0.72
        },
        {
            "description": "Hot flashes and night sweats disrupting sleep",
            "condition": "Menopause",
            "treatment": "Hormone replacement therapy",
            "success_rate": 0.88
        },
        # Mental health manifestations
        {
            "description": "Crushing chest tightness with fear of dying",
            "condition": "Panic Attack",
            "treatment": "CBT and SSRIs",
            "success_rate": 0.81
        },
        {
            "description": "Constant worry about everything for months",
            "condition": "Generalized Anxiety Disorder",
            "treatment": "Therapy and anxiolytics",
            "success_rate": 0.76
        },
        # Rare conditions
        {
            "description": "Involuntary facial twitching on one side",
            "condition": "Hemifacial Spasm",
            "treatment": "Botox injections",
            "success_rate": 0.89
        },
        {
            "description": "Sudden episodes of falling asleep during day",
            "condition": "Narcolepsy",
            "treatment": "Modafinil and sodium oxybate",
            "success_rate": 0.74
        },
        {
            "description": "Chronic pain all over body with fatigue",
            "condition": "Fibromyalgia",
            "treatment": "Duloxetine and exercise therapy",
            "success_rate": 0.62
        },
        {
            "description": "Blue-grey skin discoloration after medication",
            "condition": "Argyria",
            "treatment": "Discontinue silver compounds, laser therapy",
            "success_rate": 0.45
        },
        {
            "description": "Inability to recognize faces even of family",
            "condition": "Prosopagnosia",
            "treatment": "Compensatory strategies training",
            "success_rate": 0.58
        },
        # Additional common conditions
        {
            "description": "Severe headache with stiff neck and light sensitivity",
            "condition": "Meningitis",
            "treatment": "IV antibiotics and supportive care",
            "success_rate": 0.80
        },
        {
            "description": "Vertigo triggered by rolling over in bed",
            "condition": "Benign Paroxysmal Positional Vertigo",
            "treatment": "Epley maneuver",
            "success_rate": 0.94
        },
        {
            "description": "Ringing in ears after loud noise exposure",
            "condition": "Acoustic Trauma Tinnitus",
            "treatment": "Sound therapy and hearing protection",
            "success_rate": 0.66
        },
        {
            "description": "Sudden swelling of lips and tongue",
            "condition": "Angioedema",
            "treatment": "Epinephrine and antihistamines",
            "success_rate": 0.92
        },
        {
            "description": "Painful blisters in a band around torso",
            "condition": "Shingles",
            "treatment": "Antiviral medication and pain management",
            "success_rate": 0.85
        },
        {
            "description": "Vision gradually becoming blurry and colors faded",
            "condition": "Cataracts",
            "treatment": "Surgical lens replacement",
            "success_rate": 0.96
        },
        {
            "description": "Progressive difficulty swallowing solid foods",
            "condition": "Esophageal Stricture",
            "treatment": "Endoscopic dilation",
            "success_rate": 0.83
        },
        {
            "description": "Persistent hoarseness lasting over 3 weeks",
            "condition": "Vocal Cord Nodules",
            "treatment": "Voice therapy and vocal rest",
            "success_rate": 0.78
        },
        {
            "description": "Swollen lymph nodes in neck persisting for months",
            "condition": "Lymphoma",
            "treatment": "Chemotherapy and radiation",
            "success_rate": 0.71
        },
        {
            "description": "Muscle weakness that worsens with use",
            "condition": "Myasthenia Gravis",
            "treatment": "Pyridostigmine and immunosuppression",
            "success_rate": 0.79
        },
        {
            "description": "Sudden loss of peripheral vision",
            "condition": "Retinal Detachment",
            "treatment": "Emergency retinal surgery",
            "success_rate": 0.88
        },
        {
            "description": "Painful red eye with blurred vision",
            "condition": "Acute Angle-Closure Glaucoma",
            "treatment": "Laser iridotomy and pressure lowering drops",
            "success_rate": 0.91
        },
        {
            "description": "Profuse sweating at night soaking sheets",
            "condition": "Night Sweats from Lymphoma",
            "treatment": "Treat underlying lymphoma",
            "success_rate": 0.73
        },
        {
            "description": "Recurrent fainting when standing up quickly",
            "condition": "Orthostatic Hypotension",
            "treatment": "Compression stockings and fluid intake",
            "success_rate": 0.82
        },
        {
            "description": "Painless lump in testicle that's getting bigger",
            "condition": "Testicular Cancer",
            "treatment": "Orchiectomy and chemotherapy",
            "success_rate": 0.95
        },
        {
            "description": "Chronic sinus pressure and loss of smell",
            "condition": "Chronic Rhinosinusitis",
            "treatment": "Nasal steroids and sinus surgery",
            "success_rate": 0.76
        },
        {
            "description": "Extreme thirst and frequent urination at night",
            "condition": "Diabetes Insipidus",
            "treatment": "Desmopressin replacement",
            "success_rate": 0.90
        },
        {
            "description": "Hair loss in circular patches",
            "condition": "Alopecia Areata",
            "treatment": "Corticosteroid injections and minoxidil",
            "success_rate": 0.64
        },
        {
            "description": "Butterfly rash across cheeks and nose",
            "condition": "Systemic Lupus Erythematosus",
            "treatment": "Hydroxychloroquine and immunosuppressants",
            "success_rate": 0.75
        },
        {
            "description": "Heel pain worst with first steps in morning",
            "condition": "Plantar Fasciitis",
            "treatment": "Stretching exercises and orthotic inserts",
            "success_rate": 0.87
        },
        {
            "description": "Persistent cough with weight loss and fever",
            "condition": "Tuberculosis",
            "treatment": "Multi-drug antibiotic regimen",
            "success_rate": 0.85
        },
        {
            "description": "Yellowing of skin and eyes",
            "condition": "Jaundice from Liver Disease",
            "treatment": "Treat underlying liver condition",
            "success_rate": 0.68
        },
        {
            "description": "Painful urination with penile discharge",
            "condition": "Gonorrhea",
            "treatment": "Dual antibiotic therapy",
            "success_rate": 0.97
        },
        {
            "description": "Sudden severe abdominal pain with vomiting",
            "condition": "Appendicitis",
            "treatment": "Emergency appendectomy",
            "success_rate": 0.98
        },
        {
            "description": "Progressive memory loss interfering with daily life",
            "condition": "Alzheimer's Disease",
            "treatment": "Cholinesterase inhibitors and memantine",
            "success_rate": 0.52
        },
        {
            "description": "Tremor in hand at rest that improves with movement",
            "condition": "Parkinson's Disease",
            "treatment": "Levodopa and deep brain stimulation",
            "success_rate": 0.77
        },
        {
            "description": "Episodes of seeing double vision",
            "condition": "Multiple Sclerosis",
            "treatment": "Disease-modifying therapies",
            "success_rate": 0.71
        },
        {
            "description": "Extreme fatigue not relieved by rest for months",
            "condition": "Chronic Fatigue Syndrome",
            "treatment": "Graded exercise and CBT",
            "success_rate": 0.59
        },
        {
            "description": "Joint pain and rash after tick bite",
            "condition": "Lyme Disease",
            "treatment": "3-4 week antibiotic course",
            "success_rate": 0.90
        },
        {
            "description": "Inability to straighten finger with nodule in palm",
            "condition": "Dupuytren's Contracture",
            "treatment": "Needle aponeurotomy or surgery",
            "success_rate": 0.82
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