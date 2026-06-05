from database import SessionLocal, engine
from models import Post

db = SessionLocal()

# Get the first post
first_post = db.query(Post).order_by(Post.id.asc()).first()

if first_post:
    first_post.title = "WEEKLY FINANCE REPORT | Week of April 14–17, 2026"
    
    html_content = """
    <strong>Simple. Fun. Actually Useful.</strong><br><br>

    <h3>🌍 WHAT'S THE BIG STORY THIS WEEK?</h3>
    One word: WAR. The ongoing conflict between the US/Israel and Iran has been the puppet master pulling every market string this week. But here's the twist — peace talks started, markets celebrated, talks broke down a little, markets got nervous again. Classic 2026 drama. 🎭<br><br>
    A Pakistan-brokered ceasefire between the US and Iran earlier in the month triggered one of the biggest global market rallies of the year. Think of it like this — the market was the kid scared of a thunderstorm, and the ceasefire was the parent saying "it's just lightning, go back to sleep."<br><br>

    <h3>🇺🇸 US MARKETS — THE COMEBACK KID</h3>
    The S&P 500 gained 3.58% last week, pulling its year-to-date return to nearly flat at -0.07% — a stunning recovery from being down nearly 10% from its January peak. Clearbrook<br><br>
    
    <strong>Dow Jones:</strong> +3.07% ✅<br>
    <strong>S&P 500:</strong> +3.58% ✅<br>
    <strong>The vibe:</strong> Relief rally 🎉<br><br>

    <em>Meme of the week: S&P 500 investors going from "I'm selling everything" on Monday to "We're so back" by Thursday 😂</em><br><br>

    On the inflation front, core CPI (the measure that strips out food and energy prices — basically the Fed's favourite number) rose just 2.6% year-over-year, below expectations. This is good news — it means underlying inflation is still cooling.<br>
    The US Fed (America's central bank that controls interest rates) meets on April 28–29. With one rate cut penciled in for 2026 and rates currently held at 3.50%–3.75%, a sustained ceasefire could meaningfully improve the inflation outlook heading into that meeting.<br><br>

    <h3>🇮🇳 INDIA — FROM 6-WEEK SLUMP TO BIGGEST RALLY IN 5 YEARS!</h3>
    Okay, this one is actually wild. 🤯<br>
    Benchmark indices Sensex and Nifty surged nearly 6% last week — their biggest weekly gain in five years, driven by the ceasefire news cooling oil prices.<br>
    The India VIX (fear gauge — think of it as the market's "panic meter"; higher = more fear) plummeted by 26% during the week, indicating reduced immediate panic.<br><br>
    
    This week (Apr 14–17)? Sensex is around 77,989 points, up about 1.3% for the week — on track for a second straight weekly gain after six consecutive weekly losses.<br><br>
    
    <strong>Winners this week:</strong> Trent, Eternal, Adani Ports, Bharat Electronics, Infosys, Tata Steel 📈<br>
    <strong>Losers this week:</strong> HDFC Bank, Titan, Mahindra & Mahindra, Bajaj Finance 📉<br><br>

    <em>"Indian markets after 6 weeks of pain finally seeing green: Me at 5 AM checking Nifty like it's my baby" 👶📱</em><br><br>

    Q4 Earnings Season is ON. Companies are reporting their January–March results. Infosys and Wipro are in the spotlight — IT stocks remain a safe haven play right now.<br><br>

    <h3>🛢️ OIL — THE DRAMA QUEEN OF MARKETS</h3>
    Oil is the reason everything was crazy this month. Crude oil pulled back sharply from weekly highs around $117 per barrel to near $98, as ceasefire developments eased supply fears.<br>
    Why does this matter for India? India imports ~85% of its oil. When oil is expensive:<br>
    <ul>
        <li>Petrol prices go up 🚗💸</li>
        <li>The Rupee weakens (more dollars needed to buy oil)</li>
        <li>Companies' costs rise = profits shrink = stock prices fall</li>
    </ul>
    So cheaper oil = happy India. Simple as that!<br><br>

    <h3>🌏 GLOBAL SNAPSHOT</h3>
    Europe's STOXX 600 ended up 3.05%. Germany's DAX gained 2.74%, France's CAC 40 climbed 3.73%, and Japan's Nikkei 225 surged 7.15% — all riding the ceasefire wave.<br>
    The IMF (global financial watchdog) now projects global growth at 3.1% for 2026 — decent, but not great. Think of it as the global economy jogging, not sprinting.<br>
    Emerging markets (countries like India, Brazil, Indonesia — developing economies with fast-growing potential) had their growth forecast trimmed to 3.9% for 2026, down from 4.2% estimated in January.<br><br>

    <h3>📌 KEY TERMS DECODED</h3>
    <strong>Ceasefire Rally:</strong> When markets jump because a war or conflict shows signs of pausing. Less fear = more buying.<br>
    <strong>Core CPI:</strong> Inflation measure excluding food & energy. The number central banks obsess over.<br>
    <strong>VIX / Fear Gauge:</strong> Measures how nervous investors are. Above 20 = choppy waters.<br>
    <strong>FII:</strong> Big foreign funds that invest in Indian markets. When they sell, markets fall. When they buy, markets rise.<br>
    <strong>Rate Cut:</strong> When a central bank lowers interest rates to make borrowing cheaper and boost the economy.<br><br>

    <h3>🔮 WHAT TO WATCH NEXT WEEK</h3>
    <ul>
        <li><strong>US Fed Meeting (Apr 28–29):</strong> Will they hint at a rate cut? Markets are watching like hawks 🦅</li>
        <li><strong>US–Iran Talks:</strong> Any breakdown = oil prices spike again</li>
        <li><strong>Indian Q4 Results:</strong> Infosys, HDFC Bank, and others reporting. Guidance will matter more than the results themselves.</li>
        <li><strong>Oil Prices:</strong> Stay below $100? India breathes easy. Spike above? Buckle up.</li>
    </ul>

    <h3>💡 BOTTOM LINE</h3>
    The world went from "war panic" to "ceasefire hope" to "back to uncertainty" — all in one week. Markets love certainty and hate surprises. Right now, we're in a cautiously optimistic zone. India especially had a great run — but don't pop the champagne just yet. The Strait of Hormuz is still not fully open, and peace is still fragile.<br><br>
    <strong>Stay invested. Stay informed. Don't panic-sell. 💪</strong><br><br>
    
    <span style="font-size: 0.8rem; color: #a0a5b5;">Disclaimer: This report is for educational purposes only. Not investment advice. Please consult a SEBI-registered advisor before making investment decisions.</span>
    """
    
    first_post.content = html_content.strip()
    db.commit()
    print("Database officially updated with new Weekly Finance Report!")
else:
    print("No posts found in database.")

db.close()
