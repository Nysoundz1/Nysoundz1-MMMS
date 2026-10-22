# School Mass Music Management System (SMMMS)
### Our Lady of Grace Senior High School (OLAG SHS)

An official liturgical music planning and management platform designed for Our Lady of Grace Senior High School (OLAG). SMMMS enables Catholic music groups, choir directors, cantors, and the school chaplaincy to organize, enter, review, and access Mass music arrangements seamlessly on desktop and mobile devices.

---

## 🏛️ Core Modules

1. **Dashboard**
   - Upcoming Mass celebration highlight with celebrant, venue, and choir details
   - Today's Mass arrangement live preview
   - Real-time counter for pending arrangement submissions
   - Recently added hymn count and quick shortcuts

2. **Mass Schedule**
   - Date, occasion/theme, liturgical season (Ordinary Time, Easter, Solemnity, Advent, Lent, Christmas)
   - Celebrant, assigned music group, and venue
   - Interactive monthly calendar with liturgical season indicators
   - Coordinator action: `+ Create Mass & Assign Group`

3. **Mass Arrangement (13 Catholic Liturgical Steps)**
   1. Entrance
   2. Penitential Rite
   3. Gloria
   4. Responsorial Psalm
   5. Gospel Acclamation
   6. Offertory
   7. Sanctus
   8. Memorial Acclamation
   9. Great Amen
   10. Agnus Dei
   11. Communion
   12. Thanksgiving
   13. Recessional
   - Song selection with key signature, time signature, and tempo (BPM)
   - Concert pitch pipe & triad audio reference (Web Audio API)
   - Real-time transposable chords & lyrics viewer
   - Submission workflow: `Submit for Review`, `Save as Draft`, `📱 Copy WhatsApp Text`, and `🖨️ Print Final Programme`

4. **Song Library**
   - Liturgical hymn repertoire catalog
   - Searchable by title, composer, category, key, and time signature
   - Transposable chord sheets & lyrics
   - Pitch references and PDF score links
   - Fast modal for adding new hymns to the library

5. **Music Groups**
   - Profiles for school music ensembles:
     - **School Choir** (SATB High Mass Choir)
     - **Youth Choir**
     - **Chapel Choir**
     - **Inspirational Band Ministry**
     - **Cantors & Soloists Guild**
   - Rosters, section leaders, rehearsal schedules, assigned Masses, and arrangement counts

6. **Approval System**
   - Workflow states: **Draft → Submitted → Reviewed → Approved**
   - Coordinator can review submissions and make in-line corrections before approval
   - Approved arrangements become the official programme accessible across the school

7. **Archive**
   - Historical catalogue of past Mass arrangements
   - **🔄 Reuse Arrangement:** 1-click duplication of all 13 song selections from an archive Mass into an upcoming Mass
   - Print-ready liturgical leaflet export (`window.print()`)

---

## 📱 Mobile Experience

- Fully responsive web layout optimized for mobile screens in the choir loft
- Dedicated interactive in-app phone preview (`📱 Phone View`)
- One-click formatted WhatsApp summary generation for music group chats

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)

### Run Locally
```bash
# Clone the repository
git clone <repository-url>
cd MMMS

# Start the local server
npm start
# or: node server.js
```

Open your browser and navigate to:
- **Local:** [http://localhost:3000](http://localhost:3000)
- **Local Network / Mobile:** `http://<your-ip>:3000`

---

## 📜 Liturgical Structure

All Mass music arrangements follow Catholic liturgical guidelines according to the General Instruction of the Roman Missal (GIRM) and the liturgical calendar of the Catholic Church.
