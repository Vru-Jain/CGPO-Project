import streamlit as st
import pandas as pd
import os
from datetime import datetime

# --- Configuration ---
CSV_FILE = 'survey_responses.csv'

# Page Setup
st.set_page_config(page_title="CGPO Research Survey", page_icon="📈")

st.title("📈 Cognitive Graph Portfolio Optimizer (CGPO)")
st.subheader("Field Validation Survey")
st.markdown("""
**Introduction:**
We are final-year students developing a decision-support system that uses AI to optimize financial portfolios. 
It combines analysis of **text and audio** (earnings calls) with a **graph-based view** of asset interdependencies. 
Your feedback is critical for validating our research requirements.
""")

st.divider()

# --- Form Logic ---
with st.form("research_survey_form"):
    
    # Section 1: Demographics
    st.markdown("### 1. Background")
    profession = st.radio(
        "What is your primary area of study or profession?",
        ["Finance / Economics", "Data Science / CS", "Business Admin", "Other"]
    )
    familiarity = st.slider(
        "How familiar are you with current portfolio management tools (e.g., Bloomberg, QuantConnect)?",
        min_value=1, max_value=5, help="1=Not familiar, 5=Expert"
    )

    # Section 2: Problem Validation (Hypotheses)
    st.markdown("### 2. Current Challenges")
    correlation_opinion = st.selectbox(
        "Do 'Correlation Matrices' accurately capture hidden relationships (like supply chains) during market crashes?",
        ["Yes, they are sufficient.", "No, they often fail.", "Unsure."]
    )
    audio_usage = st.selectbox(
        "How often do you consider the *tone/hesitation* of a CEO during an earnings call?",
        ["Never", "Sometimes", "Frequently", "Important but lack tools"]
    )

    # Section 3: Feature Feedback
    st.markdown("### 3. Proposed Solution Feedback")
    audio_value = st.slider(
        "How valuable would a 'Speaker Hesitation' metric be for detecting risk?",
        1, 5
    )
    graph_pref = st.radio(
        "Do you prefer a 'Dynamic Graph' visualization over standard spreadsheets?",
        ["Yes, graph is better", "No, prefer spreadsheets"]
    )
    rl_trust = st.radio(
        "Would you trust an AI agent to automatically execute trades?",
        ["Full Auto-Execution", "Recommendation/Support Tool only", "I would not trust it"]
    )

    # Section 4: Usability
    st.markdown("### 4. Usability Requirements")
    wait_time = st.selectbox(
        "Maximum acceptable wait time for model inference on a new earnings call?",
        ["Real-time (<1 sec)", "Under 5 minutes", "Under 1 hour", "End of Day"]
    )
    
    # Submit Button
    submitted = st.form_submit_button("Submit Response")

# --- Handling Submission ---
if submitted:
    # 1. Gather data into a dictionary
    new_data = {
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Profession": profession,
        "Familiarity_Score": familiarity,
        "Correlation_Opinion": correlation_opinion,
        "Audio_Usage": audio_usage,
        "Audio_Metric_Value": audio_value,
        "Graph_Preference": graph_pref,
        "AI_Trust_Level": rl_trust,
        "Wait_Time_Req": wait_time
    }
    
    # 2. Convert to DataFrame
    df_new = pd.DataFrame([new_data])
    
    # 3. Append to CSV (create if doesn't exist)
    if not os.path.exists(CSV_FILE):
        df_new.to_csv(CSV_FILE, index=False)
    else:
        df_new.to_csv(CSV_FILE, mode='a', header=False, index=False)
    
    st.success("Thank you! Your response has been recorded.")
    st.balloons()

# --- Admin View (Optional: For your eyes only) ---
st.divider()
if os.path.exists(CSV_FILE):
    df = pd.read_csv(CSV_FILE)
    st.caption(f"Total Responses Collected: {len(df)}")
    # Uncomment the line below if you want to see the data live on the app
    # st.dataframe(df)