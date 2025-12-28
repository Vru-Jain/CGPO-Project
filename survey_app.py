import streamlit as st
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import os
import json  # <--- NEW IMPORT

# --- CONFIGURATION ---
GOOGLE_SHEET_NAME = "CGPO_Survey_Data"
KEY_FILE = "service_account.json"

# --- PAGE CONFIGURATION ---
st.set_page_config(
    page_title="CGPO Research Survey", 
    page_icon="📊", 
    layout="centered"
)

# --- CUSTOM CSS ---
st.markdown("""
    <style>
        .main-header {font-size: 2rem; font-weight: 700; color: #1E3A8A;}
        .sub-header {font-size: 1.2rem; font-weight: 600; color: #4B5563; margin-top: 20px;}
        .stRadio label {font-weight: 500;}
    </style>
""", unsafe_allow_html=True)

# --- HEADER & PROJECT CONTEXT ---
st.markdown('<div class="main-header">📊 Market Insight & AI Research</div>', unsafe_allow_html=True)
st.markdown("**Project:** Cognitive Graph Portfolio Optimizer (CGPO)")
st.caption("Sole Developer: **Vrushabh** (Roll No: **25KCTYCS23**) | KC College")

with st.container():
    st.info(
        """
        **👋 Help validate my Final Year Project.**
        
        I am building a decision-support tool that uses AI to analyze:
        1. **Audio Tone** (CEO confidence/hesitation).
        2. **Supply Chain Graphs** (Hidden connections).
        
        *Your feedback will help validate the requirements for this system.*
        """
    )
st.divider()

# --- SMARTER GOOGLE SHEETS CONNECTION ---
def get_sheet():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    
    # METHOD 1: Try to load from Streamlit Cloud Secrets (Best for Deployment)
    if "gcp_service_account" in st.secrets:
        try:
            # We parse the text you pasted in Secrets back into a dictionary
            creds_dict = json.loads(st.secrets["gcp_service_account"])
            creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        except Exception as e:
            st.error(f"❌ Secrets Error: {e}")
            st.stop()
            
    # METHOD 2: Try to load from Local File (Best for Localhost/Laptop)
    elif os.path.exists(KEY_FILE):
        creds = ServiceAccountCredentials.from_json_keyfile_name(KEY_FILE, scope)
        
    # FAILURE: Neither method worked
    else:
        st.error("❌ Critical Error: credentials not found in Secrets or Local File.")
        st.stop()

    # Connect to the Sheet
    try:
        client = gspread.authorize(creds)
        return client.open(GOOGLE_SHEET_NAME).sheet1
    except Exception as e:
        st.error(f"❌ Connection Error: {e}")
        st.stop()

# --- THE FORM ---
with st.form("research_form"):
    
    # --- SECTION 1: USER PROFILE ---
    st.markdown("### 1. User Profile")
    
    # Optional Name for Verification
    name = st.text_input("Name (Optional - for research verification only)")

    col1, col2 = st.columns(2)
    with col1:
        role = st.selectbox(
            "Current Role",
            ["Student (Finance/Eco)", "Student (Tech/Data)", "Finance Professional", "Active Investor", "Other"]
        )
    with col2:
        knowledge_level = st.select_slider(
            "Stock Market Knowledge",
            options=["Beginner", "Intermediate", "Advanced", "Expert"]
        )

    st.markdown("---")

    # --- SECTION 2: PAIN POINTS ---
    st.markdown("### 2. Current Challenges")
    
    missing_info = st.radio(
        "**Do standard news articles miss the 'real story' about a company?**",
        ["Yes, frequently", "Sometimes", "No, standard news is enough"],
        horizontal=True
    )
    
    st.write("")
    
    complexity_pain = st.radio(
        "**Is it hard to track how one company's failure affects its suppliers?**",
        ["Very Difficult", "Manageable", "Easy"],
        horizontal=True
    )

    st.markdown("---")

    # --- SECTION 3: AUDIO ANALYSIS ---
    st.markdown("### 3. Feature: Audio Analysis")
    st.caption("My system will 'listen' to earnings calls to detect hidden risks.")
    
    audio_trust = st.slider(
        "**How useful is 'Vocal Tone' (CEO confidence) as a risk indicator?**",
        0, 10, 5,
        help="0 = Useless, 10 = Critical."
    )
    
    st.write("")
    audio_cue = st.selectbox(
        "**Which vocal cue signals the highest risk to you?**",
        ["Hesitation / Stuttering", "Anger / Aggression", "Over-Excitement (Hype)", "Monotone / Robot-like"],
        help="This helps me decide which feature my AI should prioritize."
    )
    
    st.markdown("---")

    # --- SECTION 4: VISUALIZATION ---
    st.markdown("### 4. Feature: Graph Maps")
    st.caption("I want to model the market as a connected web, not just a list.")
    
    vis_preference = st.radio(
        "**Which view is better for spotting systemic risk?**",
        ["A. Standard Excel List", "B. Network Map (Visual Connections)"]
    )

    st.markdown("---")

    # --- SECTION 5: USABILITY & TRUST ---
    st.markdown("### 5. Usability & Scope")
    
    col3, col4 = st.columns(2)
    with col3:
        update_freq = st.selectbox(
            "Required Analysis Speed",
            ["Real-time (Immediate)", "End of Day Report", "Weekly Report"]
        )
    with col4:
        ai_autonomy = st.selectbox(
            "Would you trust AI to auto-trade your money?",
            ["No, I want final approval (Decision Support)", "Yes, fully automated (Black Box)"]
        )

    st.write("")
    open_feedback = st.text_area("Any other suggestions for my project? (Optional)")

    st.write("")
    
    # Submit Button
    submitted = st.form_submit_button("🚀 Submit Research Data", type="primary", use_container_width=True)

# --- HANDLING SUBMISSION ---
if submitted:
    with st.spinner("Syncing response to Cloud Database..."):
        sheet = get_sheet()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Prepare the row of data
        row_data = [
            timestamp, 
            name, 
            role, 
            knowledge_level, 
            missing_info, 
            complexity_pain, 
            audio_trust, 
            audio_cue, 
            vis_preference, 
            update_freq, 
            ai_autonomy, 
            open_feedback
        ]
        
        sheet.append_row(row_data)
        
        st.success("✅ Success! Your input has been saved to the project database.")
        st.balloons()