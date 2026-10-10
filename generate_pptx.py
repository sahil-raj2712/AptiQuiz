import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette
    BG_DARK = RGBColor(11, 15, 25)        # #0B0F19 Dark Navy
    CARD_BG = RGBColor(22, 29, 49)        # #161D31 Card background
    CARD_BORDER = RGBColor(45, 55, 85)    # #2D3755 Border
    PRIMARY = RGBColor(99, 102, 241)      # #6366F1 Indigo Accent
    CYAN = RGBColor(6, 182, 212)          # #06B6D4 Cyan
    EMERALD = RGBColor(16, 185, 129)      # #10B981 Emerald Green
    ROSE = RGBColor(244, 63, 94)          # #F43F5E Rose Red
    AMBER = RGBColor(245, 158, 11)        # #F59E0B Amber
    TEXT_WHITE = RGBColor(248, 250, 252)  # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, badge_text, title_text, subtitle_text=""):
        # Badge
        badge_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(4.5), Inches(0.38))
        badge_box.fill.solid()
        badge_box.fill.fore_color.rgb = RGBColor(30, 36, 60)
        badge_box.line.color.rgb = PRIMARY
        badge_tf = badge_box.text_frame
        badge_tf.text = badge_text.upper()
        p = badge_tf.paragraphs[0]
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = CYAN
        p.alignment = PP_ALIGN.CENTER

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        # Subtitle
        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.text = subtitle_text
            p2.font.size = Pt(13)
            p2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Big Badge
    badge1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.65), Inches(5.1), Inches(0.42))
    badge1.fill.solid()
    badge1.fill.fore_color.rgb = RGBColor(30, 36, 65)
    badge1.line.color.rgb = PRIMARY
    b1_tf = badge1.text_frame
    b1_tf.text = "CODE2CAREER HACKATHON • PROBLEM STATEMENT #3"
    b1_p = b1_tf.paragraphs[0]
    b1_p.font.size = Pt(10)
    b1_p.font.bold = True
    b1_p.font.color.rgb = CYAN
    b1_p.alignment = PP_ALIGN.CENTER

    # Team Badge
    team_badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.3), Inches(0.65), Inches(6.0), Inches(0.42))
    team_badge.fill.solid()
    team_badge.fill.fore_color.rgb = RGBColor(35, 30, 60)
    team_badge.line.color.rgb = AMBER
    tb_tf = team_badge.text_frame
    tb_tf.text = "TEAM: LOGIC LORDS  |  LEAD: SAHIL RAJ  |  MEMBER: SHAURYA PRATAP SINGH"
    tb_p = tb_tf.paragraphs[0]
    tb_p.font.size = Pt(9.5)
    tb_p.font.bold = True
    tb_p.font.color.rgb = RGBColor(253, 224, 71)
    tb_p.alignment = PP_ALIGN.CENTER

    # Main Title
    t1_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.35), Inches(11.3), Inches(2.0))
    t1_tf = t1_box.text_frame
    t1_tf.word_wrap = True
    p = t1_tf.paragraphs[0]
    p.text = "AptiQuiz"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p_sub = t1_tf.add_paragraph()
    p_sub.text = "Live Multiplayer Aptitude Esports Arena for Campus Placements"
    p_sub.font.size = Pt(20)
    p_sub.font.color.rgb = CYAN

    p_lead = t1_tf.add_paragraph()
    p_lead.text = "Presented by Team Logic Lords — Sahil Raj (Lead) & Shaurya Pratap Singh"
    p_lead.font.size = Pt(13)
    p_lead.font.bold = True
    p_lead.font.color.rgb = RGBColor(203, 213, 225)

    # 3 Summary Cards
    card_data = [
        ("⚡ 50-Player Real-Time Arena", "Up to 50 concurrent students racing per room under real high-stakes test pressure with sub-50ms synchronization."),
        ("🛡️ Server-as-Referee Anti-Cheat", "Authoritative server clock, zero client trust, randomized question/option shuffling, and latency compensation."),
        ("🏆 Inter-College League System", "Aggregated campus rankings (NIET, GL BAJAJ, AMITY, IITs) and recruiter-grade topic strength analytics.")
    ]
    for i, (title, desc) in enumerate(card_data):
        x = Inches(1.0 + i * 3.9)
        c = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(3.6), Inches(3.55), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER
        ctf = c.text_frame
        ctf.word_wrap = True
        cp = ctf.paragraphs[0]
        cp.text = title
        cp.font.size = Pt(15)
        cp.font.bold = True
        cp.font.color.rgb = TEXT_WHITE
        cp2 = ctf.add_paragraph()
        cp2.text = desc
        cp2.font.size = Pt(12)
        cp2.font.color.rgb = TEXT_MUTED

    # Bottom Live URL Bar
    url_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(6.1), Inches(11.3), Inches(0.75))
    url_box.fill.solid()
    url_box.fill.fore_color.rgb = RGBColor(16, 45, 35)
    url_box.line.color.rgb = EMERALD
    utf = url_box.text_frame
    up = utf.paragraphs[0]
    up.text = "🌐 LIVE CLOUD URL:  https://aptiquiz-q9br.onrender.com/    |    GITHUB:  sahil-raj2712/AptiQuiz"
    up.font.size = Pt(13)
    up.font.bold = True
    up.font.color.rgb = RGBColor(110, 231, 183)
    up.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: THE PROBLEM
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "The Problem We Solve", "Why 80% of College Students Fail Placement Screening Filters", "Traditional aptitude preparation is passive, isolated, and gives a false sense of security.")

    prob_cards = [
        ("📄 1. Passive Solo Practice", ROSE, "Students practice alone with static PDFs or slow Google Forms. They study in comfort with zero competitive pressure or peer benchmarking until the actual elimination test."),
        ("⏱️ 2. Clock-Panic Syndrome", AMBER, "Real company tests (TCS, Infosys, Amazon) demand solving complex problems in 25–30 seconds. Solo study never trains high-cortisol mental reflexes and quick decision making."),
        ("📊 3. Zero Placement Cell Radar", PRIMARY, "College Training & Placement Cells (T&P) have no real-time diagnostics to see if their batch is failing in Quantitative, Logical Reasoning, or Verbal Ability until companies reject them.")
    ]
    for i, (title, color, desc) in enumerate(prob_cards):
        x = Inches(0.8 + i * 3.95)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(4.3))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = color
        c.line.width = Pt(2)
        ctf = c.text_frame
        ctf.word_wrap = True
        p = ctf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p2 = ctf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13.5)
        p2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 3: SOLUTION - ESPORTS GAME LOOP
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Gamified Architecture", "The AptiQuiz Esports Game Loop", "How AptiQuiz turns placement screening preparation into an adrenaline-filled live spectator competition.")

    loop_steps = [
        ("01", "Instant QR / PIN Join", "Zero friction. Students scan the projector QR code or enter the 6-character room PIN. Joins the live lobby in under 3 seconds with avatar & college tag.", CYAN),
        ("02", "Synchronized Countdown", "All 50 connected screens receive problems at the exact same millisecond with ticking server audio synthesis and visual countdown timers.", PRIMARY),
        ("03", "Strategic Power-Ups", "50:50 wrong-option elimination and 2X Point Multiplier add tactical depth. Negative marking option penalizes random guessing.", AMBER),
        ("04", "Live Dynamic Rank Ticker", "Instant feedback reveals exact option picked vs correct solution with step-by-step logic, peer distribution bar chart, and position climb (+▲) / drop (-▼).", EMERALD)
    ]
    for i, (step, title, desc, col) in enumerate(loop_steps):
        x = Inches(0.8 + i * 2.95)
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(2.8), Inches(3.7))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER
        ctf = c.text_frame
        ctf.word_wrap = True
        p_num = ctf.paragraphs[0]
        p_num.text = step
        p_num.font.size = Pt(28)
        p_num.font.bold = True
        p_num.font.color.rgb = col
        p_t = ctf.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_d = ctf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_MUTED

    # Formula Box
    f_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.1), Inches(11.7), Inches(0.8))
    f_box.fill.solid()
    f_box.fill.fore_color.rgb = RGBColor(20, 25, 45)
    f_box.line.color.rgb = PRIMARY
    ftf = f_box.text_frame
    fp = ftf.paragraphs[0]
    fp.text = "🎯 Authoritative Scoring Formula: Score = 500 (Base) + [ (TimeRemaining / TotalTime) * 500 (Speed) ] * StreakMultiplier (1.1x to 1.5x)"
    fp.font.size = Pt(12)
    fp.font.bold = True
    fp.font.color.rgb = TEXT_WHITE
    fp.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 4: SERVER-AS-REFEREE & ANTI-CHEAT
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Hackathon Rule #1 Enforcement", "Server-as-Referee & Anti-Cheat Engine", "Strict zero client-side trust architecture to guarantee tamper-proof placement screenings.")

    col1 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(5.7), Inches(4.6))
    col1.fill.solid()
    col1.fill.fore_color.rgb = CARD_BG
    col1.line.color.rgb = PRIMARY
    c1tf = col1.text_frame
    c1tf.word_wrap = True
    p = c1tf.paragraphs[0]
    p.text = "🛡️ Authoritative Server Clock"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = CYAN
    bullets1 = [
        "Zero Trust on Client Device Clocks: The server epoch clock exclusively dictates question countdown, start, and hard cutoff (+350ms network transit buffer).",
        "No Answer Keys Transmitted: Correct answer IDs are NEVER included in question_start payloads. Answers live strictly in backend memory.",
        "Deterministic Rejection: Submissions arriving after the server time cutoff are automatically rejected by the authoritative referee.",
        "Anti-Spam Throttling: Enforces 1 submission per candidate per round with atomic validation."
    ]
    for b in bullets1:
        pb = c1tf.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    col2 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.2), Inches(5.7), Inches(4.6))
    col2.fill.solid()
    col2.fill.fore_color.rgb = CARD_BG
    col2.line.color.rgb = CYAN
    c2tf = col2.text_frame
    c2tf.word_wrap = True
    p = c2tf.paragraphs[0]
    p.text = "🔀 Candidate Option Shuffling"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    bullets2 = [
        "Screen-Peeking Prevention: In college computer labs, students glance at adjacent monitors. AptiQuiz randomizes option choices on each candidate's device.",
        "Unique Feed per Student: Option A for Candidate 1 is Option C for Candidate 2.",
        "Host Shuffling Toggles: Host can decide in the room setup modal whether to:",
        "  1. Shuffle Questions in the test (or keep curriculum order Q1 -> Q2 -> Q3)",
        "  2. Shuffle Options per student (or keep static A/B/C/D for auditorium projectors)",
        "Review Resolution: The review screen decodes each student's personal choice and highlights both what they clicked and the true correct option."
    ]
    for b in bullets2:
        pb = c2tf.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 5: NETWORK DELAY FAIRNESS
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Latency Engineering", "Network Delay Fairness Algorithm", "Ensuring students on 120ms mobile 4G aren't penalized against campus gigabit LAN connections.")

    # Left: Explanation
    l_box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(6.8), Inches(4.6))
    l_box.fill.solid()
    l_box.fill.fore_color.rgb = CARD_BG
    l_box.line.color.rgb = CARD_BORDER
    ltf = l_box.text_frame
    ltf.word_wrap = True
    p = ltf.paragraphs[0]
    p.text = "How Latency Compensation Operates:"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    steps = [
        "1. Real-Time Heartbeat Ping: Clients ping server every 8s. Server computes Round-Trip Time (RTT).",
        "2. Bounded One-Way Delay: Server bounds estimated ping between 0 and 400ms to prevent spoofing: transitDelay = round(estimatedPing / 2).",
        "3. Cognitive Reaction Time: When answer packet arrives at server elapsed time T, server subtracts transit delay: FairResponseTime = max(200, elapsedMs - transitDelay).",
        "4. Equal Bonus for Equal Speed: Two students who read and click the answer with identical mental reaction time receive identical points, regardless of connection latency."
    ]
    for st in steps:
        sp = ltf.add_paragraph()
        sp.text = st
        sp.font.size = Pt(12)
        sp.font.color.rgb = TEXT_MUTED

    # Right: Reconnection Card
    r_box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.9), Inches(2.2), Inches(4.6), Inches(4.6))
    r_box.fill.solid()
    r_box.fill.fore_color.rgb = RGBColor(16, 35, 45)
    r_box.line.color.rgb = CYAN
    rtf = r_box.text_frame
    rtf.word_wrap = True
    p = rtf.paragraphs[0]
    p.text = "🔄 Mid-Match Reconnection Test"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = CYAN
    reconn_text = [
        "• Temporary Wi-Fi Drop Protection: If student refreshes browser or loses mobile 4G packet signal, client reconnects using persistent UUID.",
        "• State Restoration: Server immediately rebinds the player's socket, restores active countdown timer, cumulative score, highest streak, and topic stats.",
        "• Benchmark Result: Candidate_15 disconnected mid-match during benchmark test -> 100% recovered with ZERO state loss."
    ]
    for r in reconn_text:
        rp = rtf.add_paragraph()
        rp.text = r
        rp.font.size = Pt(12)
        rp.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 6: FULL-STACK ARCHITECTURE
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Engineering & Deployment", "Full-Stack System Architecture", "Unified single-port cloud architecture with zero dependencies and sub-1s builds.")

    arch_cards = [
        ("Frontend Tier", "React 19 + Vite 8", [
            "Vanilla CSS Design System (Cyberpunk Glassmorphism)",
            "Web Audio API Synthesizer (0ms asset fetch latency)",
            "Canvas Confetti celebratory particle engine",
            "Auto-adaptive QR Code for Wi-Fi and Cloud URLs",
            "Keyboard accessibility (F11, Arrow keys, 1-4 shortcuts)"
        ]),
        ("Real-Time Backend", "Node.js + Socket.IO 4.8", [
            "Authoritative Game State Machine",
            "WebSocket multiplexing with binary compression",
            "In-memory referee handling 50 concurrent sockets",
            "REST API endpoints for League, Question Sets, & CSV",
            "Dynamic Wi-Fi LAN IP detection for mobile scans"
        ]),
        ("Cloud Delivery", "Zero-Config Monorepo", [
            "Single-Port Hosting: Express serves Vite production bundle",
            "Zero CORS friction between API and Client",
            "Sub-1s production build (943ms via Vite)",
            "Live URL: https://aptiquiz-q9br.onrender.com/",
            "GitHub CI ready: sahil-raj2712/AptiQuiz"
        ])
    ]
    for i, (title, sub, bullets) in enumerate(arch_cards):
        x = Inches(0.8 + i * 3.95)
        c = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(4.6))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER
        ctf = c.text_frame
        ctf.word_wrap = True
        p = ctf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = CYAN
        p_sub = ctf.add_paragraph()
        p_sub.text = sub
        p_sub.font.size = Pt(12)
        p_sub.font.bold = True
        p_sub.font.color.rgb = TEXT_WHITE
        for b in bullets:
            pb = ctf.add_paragraph()
            pb.text = "• " + b
            pb.font.size = Pt(11)
            pb.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 7: 50-PLAYER BENCHMARK
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Strict Compliance Verification", "50-Player Automated Concurrency Benchmark", "Demonstrating 100% throughput under Problem Statement #3 peak load.")

    stats = [
        ("50 / 50", "Concurrent Sockets", CYAN),
        ("99 / 99", "Answers Graded", PRIMARY),
        ("100%", "Reconnection Pass", EMERALD),
        ("< 35ms", "Avg Grading Latency", AMBER)
    ]
    for i, (num, label, col) in enumerate(stats):
        x = Inches(0.8 + i * 2.95)
        b = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(2.8), Inches(1.5))
        b.fill.solid()
        b.fill.fore_color.rgb = CARD_BG
        b.line.color.rgb = col
        btf = b.text_frame
        p = btf.paragraphs[0]
        p.text = num
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = col
        p.alignment = PP_ALIGN.CENTER
        p2 = btf.add_paragraph()
        p2.text = label
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_WHITE
        p2.alignment = PP_ALIGN.CENTER

    # Test Script Box
    t_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.0), Inches(11.7), Inches(2.8))
    t_box.fill.solid()
    t_box.fill.fore_color.rgb = RGBColor(16, 22, 38)
    t_box.line.color.rgb = CARD_BORDER
    ttf = t_box.text_frame
    ttf.word_wrap = True
    tp = ttf.paragraphs[0]
    tp.text = "💻 Run the Automated Test Suite:  npm run test:50"
    tp.font.size = Pt(16)
    tp.font.bold = True
    tp.font.color.rgb = CYAN
    tp_b = ttf.add_paragraph()
    tp_b.text = (
        "• Spawns 50 headless WebSocket clients connecting in parallel to the authoritative referee.\n"
        "• Generates concurrent answer submissions with simulated network latency jitter and human thinking times.\n"
        "• Triggers real-time power-ups (50:50 wrong answer elimination and 2X Point Multiplier).\n"
        "• Drops Candidate_15 socket mid-match and verifies stateful reconnection with zero score loss.\n"
        "• Verifies 100% option scrambling integrity across 99 individual player payloads."
    )
    tp_b.font.size = Pt(12.5)
    tp_b.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 8: CAMPUS LEAGUE & FACULTY STUDIO
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Institutional Value", "Inter-College League & Faculty Studio", "Connecting campus pride with actionable placement cell diagnostic data.")

    c_cards = [
        ("🏛️ Inter-College League Ladder", CYAN, "Every match automatically awards placement points to student colleges: NIET, GL BAJAJ, AMITY, IIT Bombay, BITS Pilani, etc. Fosters campus esports rivalries and daily engagement."),
        ("🌟 Hall of Fame with College Filter", EMERALD, "Interactive university filter allowing college deans and recruiters to view the top 100 performers for their specific college, including accuracy and match count."),
        ("📥 Faculty Studio & CSV Audit", PRIMARY, "Professors author custom question sets, configure test durations, toggle shuffle modes, and download complete placement audit CSVs with individual topic strengths.")
    ]
    for i, (title, col, desc) in enumerate(c_cards):
        x = Inches(0.8 + i * 3.95)
        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(4.6))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        ctf = c.text_frame
        ctf.word_wrap = True
        p = ctf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p2 = ctf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 9: ROADMAP & BUSINESS VALUE
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Future Vision & Monetization", "Product Roadmap & Business Impact", "From campus hackathon prototype to nationwide placement screening standard.")

    road_cards = [
        ("Phase 1: Zero-Friction Entry", CYAN, [
            "Instant QR / PIN Guest Entry (Zero drop-off)",
            "Authoritative referee for 50 players",
            "College League & Hall of Fame filters",
            "Latency compensation & Anti-cheat"
        ]),
        ("Phase 2: Enterprise Auth", PRIMARY, [
            "University Roll Number / Google SSO login",
            "Personal placement readiness score percentile",
            "Topic radar: Quantitative vs Logical vs Verbal",
            "Student career resume verification badge"
        ]),
        ("Phase 3: B2B Monetization", EMERALD, [
            "Corporate sponsored tests (TCS, Infosys, Amazon)",
            "Direct hiring pipeline from verified Top 5% leaderboard",
            "Institutional SaaS license for Tier 2/3 engineering colleges",
            "AI-powered dynamic difficulty scaling"
        ])
    ]
    for i, (title, col, bullets) in enumerate(road_cards):
        x = Inches(0.8 + i * 3.95)
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(4.6))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        ctf = c.text_frame
        ctf.word_wrap = True
        p = ctf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = col
        for b in bullets:
            pb = ctf.add_paragraph()
            pb.text = "• " + b
            pb.font.size = Pt(12)
            pb.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 10: LIVE DEMO & CONCLUSION
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)

    # Big Badge
    d_badge = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.5), Inches(0.8), Inches(4.3), Inches(0.45))
    d_badge.fill.solid()
    d_badge.fill.fore_color.rgb = RGBColor(16, 45, 35)
    d_badge.line.color.rgb = EMERALD
    dtf = d_badge.text_frame
    dp = dtf.paragraphs[0]
    dp.text = "LIVE CLOUD DEMONSTRATION"
    dp.font.size = Pt(11)
    dp.font.bold = True
    dp.font.color.rgb = RGBColor(110, 231, 183)
    dp.alignment = PP_ALIGN.CENTER

    # Main Headline
    t10_box = s10.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.3), Inches(1.5))
    t10_tf = t10_box.text_frame
    t10_tf.word_wrap = True
    p = t10_tf.paragraphs[0]
    p.text = "Let's Play Live on Your Phones Right Now!"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.alignment = PP_ALIGN.CENTER

    p_sub = t10_tf.add_paragraph()
    p_sub.text = "Scan the QR code or enter the 6-character room PIN to race against your fellow judges and classmates."
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.alignment = PP_ALIGN.CENTER

    # 2 Action Cards
    # Live URL Button
    live_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.8), Inches(3.3), Inches(4.6), Inches(2.2))
    live_card.fill.solid()
    live_card.fill.fore_color.rgb = RGBColor(16, 45, 35)
    live_card.line.color.rgb = EMERALD
    live_card.line.width = Pt(2)
    ltf = live_card.text_frame
    ltf.word_wrap = True
    lp = ltf.paragraphs[0]
    lp.text = "🌐 Live Cloud Deployment"
    lp.font.size = Pt(18)
    lp.font.bold = True
    lp.font.color.rgb = RGBColor(110, 231, 183)
    lp2 = ltf.add_paragraph()
    lp2.text = "https://aptiquiz-q9br.onrender.com/"
    lp2.font.size = Pt(13)
    lp2.font.bold = True
    lp2.font.color.rgb = TEXT_WHITE
    lp3 = ltf.add_paragraph()
    lp3.text = "Deployed live on Render • Accessible from any phone or browser anywhere in the world."
    lp3.font.size = Pt(11)
    lp3.font.color.rgb = TEXT_MUTED

    # GitHub Button
    git_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(3.3), Inches(4.6), Inches(2.2))
    git_card.fill.solid()
    git_card.fill.fore_color.rgb = CARD_BG
    git_card.line.color.rgb = PRIMARY
    git_card.line.width = Pt(2)
    gtf = git_card.text_frame
    gtf.word_wrap = True
    gp = gtf.paragraphs[0]
    gp.text = "📂 Open-Source GitHub Repository"
    gp.font.size = Pt(18)
    gp.font.bold = True
    gp.font.color.rgb = CYAN
    gp2 = gtf.add_paragraph()
    gp2.text = "https://github.com/sahil-raj2712/AptiQuiz"
    gp2.font.size = Pt(13)
    gp2.font.bold = True
    gp2.font.color.rgb = TEXT_WHITE
    gp3 = gtf.add_paragraph()
    gp3.text = "Complete source code, 50-player simulation test suite, and architectural documentation."
    gp3.font.size = Pt(11)
    gp3.font.color.rgb = TEXT_MUTED

    # Footer
    foot = s10.shapes.add_textbox(Inches(1.0), Inches(5.8), Inches(11.3), Inches(1.2))
    ftf = foot.text_frame
    fp = ftf.paragraphs[0]
    fp.text = "Team: Logic Lords  •  Team Lead: Sahil Raj  •  Member: Shaurya Pratap Singh"
    fp.font.size = Pt(15)
    fp.font.bold = True
    fp.font.color.rgb = CYAN
    fp.alignment = PP_ALIGN.CENTER

    fp2 = ftf.add_paragraph()
    fp2.text = "Thank you! We are now open for Judges' Q&A."
    fp2.font.size = Pt(17)
    fp2.font.bold = True
    fp2.font.color.rgb = TEXT_WHITE
    fp2.alignment = PP_ALIGN.CENTER

    # Save to file
    output_path = "AptiQuiz_LogicLords.pptx"
    prs.save(output_path)
    print(f"Successfully generated PowerPoint file: {output_path}")

    try:
        prs.save("AptiQuiz_Presentation.pptx")
        print("Successfully updated: AptiQuiz_Presentation.pptx")
    except Exception as e:
        print(f"Notice: AptiQuiz_Presentation.pptx is open in PowerPoint. Saved as {output_path} instead.")

if __name__ == "__main__":
    create_deck()
