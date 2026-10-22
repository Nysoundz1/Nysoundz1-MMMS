// Liturgical Data aligned with the OLAG SHS SMMMS Reference Design

const DEFAULT_LITURGICAL_SEASONS = [
  { id: 'easter', name: 'Easter', color: '#10b981', badgeClass: 'season-easter', icon: '🌅' },
  { id: 'ordinary', name: 'Ordinary Time', color: '#059669', badgeClass: 'season-ordinary', icon: '🌿' },
  { id: 'advent', name: 'Advent', color: '#7c3aed', badgeClass: 'season-advent', icon: '🕯️' },
  { id: 'christmas', name: 'Christmas', color: '#d97706', badgeClass: 'season-christmas', icon: '⭐' },
  { id: 'lent', name: 'Lent', color: '#6d28d9', badgeClass: 'season-lent', icon: '✝️' },
  { id: 'solemnity', name: 'Solemnity / Feasts', color: '#dc2626', badgeClass: 'season-solemnity', icon: '👑' }
];

// The 13 Catholic Liturgical Mass Parts specified for SMMMS
const MASS_PARTS = [
  { id: 'entrance', name: 'Entrance', order: 1, required: true, icon: '🚪', color: '#f59e0b' },
  { id: 'kyrie', name: 'Penitential Rite', order: 2, required: true, icon: '🙏', color: '#2563eb' },
  { id: 'gloria', name: 'Gloria', order: 3, required: false, icon: '✨', color: '#1e40af' },
  { id: 'psalm', name: 'Responsorial Psalm', order: 4, required: true, icon: '📖', color: '#059669' },
  { id: 'gospel_acclamation', name: 'Gospel Acclamation', order: 5, required: true, icon: '📜', color: '#10b981' },
  { id: 'offertory', name: 'Offertory', order: 6, required: true, icon: '🍞', color: '#0d9488' },
  { id: 'sanctus', name: 'Sanctus', order: 7, required: true, icon: '🔔', color: '#2563eb' },
  { id: 'memorial_acclamation', name: 'Memorial Acclamation', order: 8, required: true, icon: '🕊️', color: '#f97316' },
  { id: 'great_amen', name: 'Great Amen', order: 9, required: true, icon: '🙌', color: '#1d4ed8' },
  { id: 'agnus_dei', name: 'Agnus Dei', order: 10, required: true, icon: '🐑', color: '#ea580c' },
  { id: 'communion', name: 'Communion', order: 11, required: true, icon: '🍷', color: '#8b5cf6' },
  { id: 'thanksgiving', name: 'Thanksgiving', order: 12, required: false, icon: '💖', color: '#059669' },
  { id: 'recessional', name: 'Recessional', order: 13, required: true, icon: '🚶', color: '#d97706' }
];

const DEFAULT_MUSIC_GROUPS = [
  {
    id: 'grp-school-choir',
    name: 'School Choir',
    description: 'The premier SATB liturgical choral ensemble of OLAG SHS, leading Sunday high masses and official solemnities.',
    director: 'Mr. Gabriel K. Mensah',
    contact: 'choir@olagshs.edu.gh',
    rehearsalTime: 'Thursdays 4:30 PM & Saturdays 9:00 AM',
    membersCount: 42,
    avatar: '🎵',
    color: '#2563eb',
    roster: [
      { name: 'Faith Mensah', role: 'Music Group Member / Soprano' },
      { name: 'Gabriel K. Mensah', role: 'Choir Director / Organist' },
      { name: 'Bernice Addo', role: 'Soprano Section Leader' },
      { name: 'Emmanuel Tetteh', role: 'Bass Soloist / Cantor' },
      { name: 'Abigail Osei', role: 'Alto Section Leader' },
      { name: 'Kwame Asante', role: 'Tenor Section Leader' }
    ]
  },
  {
    id: 'grp-youth-choir',
    name: 'Youth Choir',
    description: 'Energetic student choir ministering during youth liturgies and semester openings.',
    director: 'Miss Deborah Anane',
    contact: 'youthchoir@olagshs.edu.gh',
    rehearsalTime: 'Wednesdays 5:00 PM',
    membersCount: 30,
    avatar: '✨',
    color: '#f59e0b',
    roster: [
      { name: 'Deborah Anane', role: 'Director' },
      { name: 'Michael Boateng', role: 'Student Leader' },
      { name: 'Caleb Arthur', role: 'Keyboardist' }
    ]
  },
  {
    id: 'grp-chapel-choir',
    name: 'Chapel Choir',
    description: 'Dedicated to weekday dawn masses, evening Benediction, and spiritual chapel liturgies.',
    director: 'Bro. Joseph Antwi',
    contact: 'chapelchoir@olagshs.edu.gh',
    rehearsalTime: 'Tuesdays 5:30 PM',
    membersCount: 28,
    avatar: '⛪',
    color: '#059669',
    roster: [
      { name: 'Bro. Joseph Antwi', role: 'Chapel Coordinator' },
      { name: 'Theresa Mensah', role: 'Cantor' },
      { name: 'Francis Kusi', role: 'Organist' }
    ]
  },
  {
    id: 'grp-inspirational-band',
    name: 'Inspirational Band Ministry',
    description: 'Dynamic sacred praise ministry featuring vocalists, guitars, piano, and African percussion.',
    director: 'Mr. David Quaye',
    contact: 'inspirationalband@olagshs.edu.gh',
    rehearsalTime: 'Fridays 4:00 PM',
    membersCount: 20,
    avatar: '🎸',
    color: '#8b5cf6',
    roster: [
      { name: 'David Quaye', role: 'Band Leader' },
      { name: 'Ruth Darko', role: 'Vocalist' },
      { name: 'Solomon Baah', role: 'Percussionist' }
    ]
  },
  {
    id: 'grp-cantors',
    name: 'Cantors & Soloists Guild',
    description: 'Trained psalmists and cantors leading the Liturgy of the Word and Responsorial Psalms.',
    director: 'Sr. Mary Agnes, HDR',
    contact: 'cantors@olagshs.edu.gh',
    rehearsalTime: 'Saturdays 11:30 AM',
    membersCount: 12,
    avatar: '🎙️',
    color: '#d97706',
    roster: [
      { name: 'Sr. Mary Agnes, HDR', role: 'Vocal Coach' },
      { name: 'Kofi Owusu', role: 'Senior Psalmist' }
    ]
  }
];

// Songs with Category, Key, Tempo, Lyrics, Chords, PDF score, and Audio reference
const DEFAULT_SONGS = [
  {
    id: 'song-easter-1',
    title: 'Christ the Lord Is Risen Today',
    composer: 'Charles Wesley',
    key: 'G',
    timeSignature: '4/4',
    tempo: '120',
    category: 'Easter',
    seasons: ['easter'],
    audioPitch: 'G4',
    pdfScore: 'scores/christ_the_lord_is_risen_today.pdf',
    audioReference: 'Easter Hymn - Brass & Choir Reference',
    lyrics: `1. Christ the Lord is risen today, Alleluia!
Sons of men and angels say, Alleluia!
Raise your joys and triumphs high, Alleluia!
Sing, ye heav'ns, and earth reply, Alleluia!

2. Lives again our glorious King, Alleluia!
Where, O death, is now thy sting? Alleluia!
Once He died, our souls to save, Alleluia!
Where thy victory, O grave? Alleluia!`,
    chords: `[Verse 1]
G        C        G        D
Christ the Lord is risen today,
G   C   D   G
Alleluia!
G        C        G        D
Sons of men and angels say,
G   C   D   G
Alleluia!
D        G        D        A
Raise your joys and triumphs high,
D   G   A   D
Alleluia!
G        C        G        D
Sing, ye heav'ns, and earth reply,
G   C   D   G
Alleluia!`
  },
  {
    id: 'song-kyrie-1',
    title: 'Lord, Have Mercy',
    composer: 'Traditional',
    key: 'D',
    timeSignature: '4/4',
    tempo: '100',
    category: 'Penitential',
    seasons: ['ordinary', 'lent', 'easter', 'advent'],
    audioPitch: 'D4',
    pdfScore: 'scores/lord_have_mercy.pdf',
    audioReference: 'Choral SATB & Organ Demo',
    lyrics: `Lord, have mercy.
(Lord, have mercy.)
Christ, have mercy.
(Christ, have mercy.)
Lord, have mercy.
(Lord, have mercy.)`,
    chords: `D        G        A        D
Lord, have mercy. (Lord, have mercy.)
Bm       Em       A        D
Christ, have mercy. (Christ, have mercy.)
G        A        D
Lord, have mercy. (Lord, have mercy.)`
  },
  {
    id: 'song-gloria-1',
    title: 'Glory to God',
    composer: 'Traditional',
    key: 'D',
    timeSignature: '4/4',
    tempo: '100',
    category: 'Gloria',
    seasons: ['ordinary', 'easter', 'christmas', 'solemnity'],
    audioPitch: 'D4',
    pdfScore: 'scores/glory_to_god.pdf',
    audioReference: 'Festive Gloria Choral Track',
    lyrics: `Glory to God in the highest,
and on earth peace to people of good will.
We praise you, we bless you,
we adore you, we glorify you,
we give you thanks for your great glory.`,
    chords: `D          G       A       D
Glory to God in the highest,
Bm         Em           A           D
And on earth peace to people of good will!
D          G            A           D
We praise you, we bless you, we adore you!`
  },
  {
    id: 'song-psalm-118',
    title: 'Psalm 118: 1-2, 16-17, 22-23',
    composer: 'Cantor & Lectionary',
    key: 'G',
    timeSignature: '4/4',
    tempo: '80',
    category: 'Psalm',
    seasons: ['easter'],
    audioPitch: 'G4',
    pdfScore: 'scores/psalm_118.pdf',
    audioReference: 'Cantor Solo & Choral Antiphon',
    lyrics: `Response:
This is the day the Lord has made; let us rejoice and be glad.

1. Give thanks to the Lord, for he is good,
his mercy endures forever.
Let the house of Israel say,
"His mercy endures forever."`,
    chords: `[Response]
G           C        D        G
This is the day the Lord has made;
Em          Am       D        G
Let us rejoice and be glad.`
  },
  {
    id: 'song-alleluia-1',
    title: 'Alleluia',
    composer: 'Traditional',
    key: 'G',
    timeSignature: '3/4',
    tempo: '100',
    category: 'Acclamation',
    seasons: ['ordinary', 'easter', 'solemnity'],
    audioPitch: 'G4',
    pdfScore: 'scores/alleluia_acclamation.pdf',
    audioReference: 'Gospel Acclamation Fanfare',
    lyrics: `Alleluia, alleluia, alleluia!
Alleluia, alleluia, alleluia!

Christ, our paschal lamb, has been sacrificed;
let us then feast with joy in the Lord.`,
    chords: `G        C     D     G
Alleluia, alleluia, alleluia!
Em       Am    D     G
Alleluia, alleluia, alleluia!`
  },
  {
    id: 'song-offertory-king',
    title: 'The King of Love My Shepherd Is',
    composer: 'Hymn / Henry Baker',
    key: 'G',
    timeSignature: '4/4',
    tempo: '96',
    category: 'Offertory',
    seasons: ['ordinary', 'easter'],
    audioPitch: 'G4',
    pdfScore: 'scores/king_of_love.pdf',
    audioReference: 'Organ & Flute Accompaniment',
    lyrics: `1. The King of love my shepherd is,
Whose goodness faileth never;
I nothing lack if I am His,
And He is mine forever.

2. Where streams of living water flow,
My ransomed soul He leadeth,
And where the verdant pastures grow,
With food celestial feedeth.`,
    chords: `[Verse 1]
G           C           D           G
The King of love my shepherd is,
Em          Am          D
Whose goodness faileth never;
G           C           D           Em
I nothing lack if I am His,
C           D           G
And He is mine forever.`
  },
  {
    id: 'song-sanctus-1',
    title: 'Holy, Holy, Holy',
    composer: 'Traditional',
    key: 'F',
    timeSignature: '4/4',
    tempo: '112',
    category: 'Sanctus',
    seasons: ['ordinary', 'easter', 'christmas'],
    audioPitch: 'F4',
    pdfScore: 'scores/sanctus_jubilee.pdf',
    audioReference: 'Sanctus Choral Setting',
    lyrics: `Holy, Holy, Holy Lord God of hosts.
Heaven and earth are full of your glory.
Hosanna in the highest.
Blessed is he who comes in the name of the Lord.
Hosanna in the highest.`,
    chords: `F        Bb       C        F
Holy, Holy, Holy Lord God of hosts.
Dm       Gm       C        F
Heaven and earth are full of your glory.
Bb       C        F
Hosanna in the highest.`
  },
  {
    id: 'song-memorial-1',
    title: 'We Proclaim Your Death, O Lord',
    composer: 'ICEL',
    key: 'D',
    timeSignature: '4/4',
    tempo: '76',
    category: 'Memorial',
    seasons: ['ordinary', 'easter', 'lent', 'advent'],
    audioPitch: 'D4',
    pdfScore: 'scores/memorial_acclamation.pdf',
    audioReference: 'Memorial Acclamation Chant',
    lyrics: `We proclaim your Death, O Lord,
and profess your Resurrection
until you come again.`,
    chords: `D           G            A            D
We proclaim your Death, O Lord,
Bm          Em           A
And profess your Resurrection
G           A            D
Until you come again.`
  },
  {
    id: 'song-amen-1',
    title: 'Amen',
    composer: 'Traditional',
    key: 'D',
    timeSignature: '3/4',
    tempo: '76',
    category: 'Amen',
    seasons: ['ordinary', 'easter', 'solemnity'],
    audioPitch: 'D4',
    pdfScore: 'scores/great_amen.pdf',
    audioReference: 'Threefold Choral Amen',
    lyrics: `Amen, Amen, Amen!`,
    chords: `D     G     D
Amen, Amen, Amen!`
  },
  {
    id: 'song-agnus-1',
    title: 'Lamb of God',
    composer: 'Traditional',
    key: 'G',
    timeSignature: '3/4',
    tempo: '72',
    category: 'Agnus Dei',
    seasons: ['ordinary', 'easter', 'lent'],
    audioPitch: 'G4',
    pdfScore: 'scores/lamb_of_god.pdf',
    audioReference: 'Agnus Dei String & Organ Track',
    lyrics: `Lamb of God, you take away the sins of the world: have mercy on us.
Lamb of God, you take away the sins of the world: have mercy on us.
Lamb of God, you take away the sins of the world: grant us peace.`,
    chords: `G         C         D         G
Lamb of God, you take away the sins of the world: have mercy on us.
Em        Am        D         G
Lamb of God, you take away the sins of the world: grant us peace.`
  },
  {
    id: 'song-communion-bread',
    title: 'I Am the Bread of Life',
    composer: 'Fr. Suzanne Toolan',
    key: 'G',
    timeSignature: '4/4',
    tempo: '96',
    category: 'Communion',
    seasons: ['ordinary', 'easter', 'solemnity'],
    audioPitch: 'G4',
    pdfScore: 'scores/i_am_the_bread_of_life.pdf',
    audioReference: 'Eucharistic Choral Procession',
    lyrics: `1. I am the Bread of life;
He who comes to me shall not hunger;
He who believes in me shall not thirst.
No one can come to me unless the Father draw him.

Refrain:
And I will raise him up, and I will raise him up,
And I will raise him up on the last day.`,
    chords: `[Verse 1]
G           Bm          C           D
I am the Bread of life;
G           Em          Am          D
He who comes to me shall not hunger;
G           Bm          C           G
He who believes in me shall not thirst.
C           G           Am    D    G
No one can come to me unless the Father draw him.

[Refrain]
G           D           Em          C
And I will raise him up, and I will raise him up,
G           C           D           G
And I will raise him up on the last day.`
  },
  {
    id: 'song-thanks-now',
    title: 'Now Thank We All Our God',
    composer: 'Martin Rinkart',
    key: 'G',
    timeSignature: '4/4',
    tempo: '100',
    category: 'Thanksgiving',
    seasons: ['ordinary', 'easter', 'solemnity'],
    audioPitch: 'G4',
    pdfScore: 'scores/now_thank_we_all_our_god.pdf',
    audioReference: 'Thanksgiving Brass & Organ Postlude',
    lyrics: `1. Now thank we all our God,
With heart and hands and voices,
Who wondrous things hath done,
In whom this world rejoices;
Who from our mother's arms
Hath blessed us on our way
With countless gifts of love,
And still is ours today.`,
    chords: `[Verse 1]
G              D              G              C
Now thank we all our God,
G              D              G
With heart and hands and voices,
G              D              G              C
Who wondrous things hath done,
G              D              G
In whom this world rejoices;`
  },
  {
    id: 'song-recessional-easter',
    title: 'Jesus Christ Is Risen Today',
    composer: 'Easter Hymn / Lyra Davidica',
    key: 'G',
    timeSignature: '4/4',
    tempo: '120',
    category: 'Recessional',
    seasons: ['easter'],
    audioPitch: 'G4',
    pdfScore: 'scores/jesus_christ_is_risen_today.pdf',
    audioReference: 'Triumphant Easter Recessional',
    lyrics: `1. Jesus Christ is risen today, Alleluia!
Our triumphant holy day, Alleluia!
Who did once upon the cross, Alleluia!
Suffer to redeem our loss. Alleluia!`,
    chords: `[Verse 1]
G        C        G        D
Jesus Christ is risen today,
G   C   D   G
Alleluia!
G        C        G        D
Our triumphant holy day,
G   C   D   G
Alleluia!`
  }
];

// Masses with Date, Occasion, Liturgical Season, Celebrant, Music Group, Venue
const DEFAULT_MASSES = [
  {
    id: 'mass-2025-05-25',
    date: '2025-05-25',
    displayDate: 'Sun, 25 May 2025',
    time: '7:00 AM',
    theme: 'Easter Sunday',
    season: 'easter',
    occasion: 'Easter Sunday High Mass',
    celebrant: 'Fr. Emmanuel K. Aidoo',
    venue: 'School Chapel',
    assignedGroupId: 'grp-school-choir',
    status: 'approved',
    arrangementId: 'arr-2025-05-25',
    thumbnail: 'assets/chalice.jpg',
    readings: 'Acts 10:34a, 37-43 | Psalm 118 | Colossians 3:1-4 | John 20:1-9'
  },
  {
    id: 'mass-2025-06-01',
    date: '2025-06-01',
    displayDate: 'Sun, 1 Jun 2025',
    time: '7:00 AM',
    theme: 'Pentecost Sunday',
    season: 'solemnity',
    occasion: 'Solemnity of Pentecost & Confirmation',
    celebrant: 'Very Rev. Fr. Anthony Mensah',
    venue: 'School Chapel',
    assignedGroupId: 'grp-youth-choir',
    status: 'submitted',
    arrangementId: 'arr-2025-06-01',
    thumbnail: 'assets/chalice.jpg',
    readings: 'Acts 2:1-11 | Psalm 104 | 1 Corinthians 12:3b-7 | John 20:19-23'
  },
  {
    id: 'mass-2025-06-08',
    date: '2025-06-08',
    displayDate: 'Sun, 8 Jun 2025',
    time: '7:00 AM',
    theme: 'Trinity Sunday',
    season: 'solemnity',
    occasion: 'Solemnity of the Most Holy Trinity',
    celebrant: 'Fr. Emmanuel K. Aidoo',
    venue: 'School Chapel',
    assignedGroupId: 'grp-chapel-choir',
    status: 'draft',
    arrangementId: 'arr-2025-06-08',
    thumbnail: 'assets/chalice.jpg',
    readings: 'Deuteronomy 4:32-34 | Psalm 33 | Romans 8:14-17 | Matthew 28:16-20'
  },
  {
    id: 'mass-2025-06-15',
    date: '2025-06-15',
    displayDate: 'Sun, 15 Jun 2025',
    time: '7:00 AM',
    theme: 'Corpus Christi',
    season: 'solemnity',
    occasion: 'Solemnity of the Most Holy Body and Blood of Christ',
    celebrant: 'Fr. Emmanuel K. Aidoo',
    venue: 'School Chapel',
    assignedGroupId: 'grp-inspirational-band',
    status: 'draft',
    arrangementId: 'arr-2025-06-15',
    thumbnail: 'assets/chalice.jpg',
    readings: 'Exodus 24:3-8 | Psalm 116 | Hebrews 9:11-15 | Mark 14:12-16'
  },
  // Previous Masses in the Archive
  {
    id: 'mass-2024-11-24',
    date: '2024-11-24',
    displayDate: 'Sun, 24 Nov 2024',
    time: '8:00 AM',
    theme: 'Solemnity of Christ the King',
    season: 'solemnity',
    occasion: 'School Feast & Eucharistic Procession',
    celebrant: 'Very Rev. Fr. Anthony Mensah',
    venue: 'School Sports Complex',
    assignedGroupId: 'grp-school-choir',
    status: 'approved',
    arrangementId: 'arr-2024-11-24',
    thumbnail: 'assets/chalice.jpg',
    readings: 'Daniel 7:13-14 | Psalm 93 | Revelation 1:5-8 | John 18:33b-37'
  },
  {
    id: 'mass-2024-11-01',
    date: '2024-11-01',
    displayDate: 'Fri, 1 Nov 2024',
    time: '9:00 AM',
    theme: 'All Saints Day High Mass',
    season: 'solemnity',
    occasion: 'Patronal Feast of All Saints',
    celebrant: 'Fr. Emmanuel K. Aidoo',
    venue: 'School Chapel',
    assignedGroupId: 'grp-school-choir',
    status: 'approved',
    arrangementId: 'arr-2024-11-01',
    thumbnail: 'assets/chalice.jpg',
    readings: 'Revelation 7:2-4, 9-14 | Psalm 24 | 1 John 3:1-3 | Matthew 5:1-12a'
  }
];

// Arrangements with the 13 parts
const DEFAULT_ARRANGEMENTS = [
  {
    id: 'arr-2025-05-25',
    massId: 'mass-2025-05-25',
    massDate: '2025-05-25',
    massDisplayDate: 'Sun, 25 May 2025',
    massTitle: 'Easter Sunday',
    groupId: 'grp-school-choir',
    groupName: 'School Choir',
    status: 'approved', // Workflow: draft -> submitted -> reviewed -> approved
    submittedAt: '2025-05-22T10:00:00Z',
    reviewedAt: '2025-05-23T11:00:00Z',
    approvedAt: '2025-05-23T14:00:00Z',
    reviewedBy: 'Mr. Gabriel Mensah (Music Coordinator)',
    coordinatorNotes: 'Verified with Sunday readings. Excellent choral balance and key signatures.',
    songs: {
      entrance: { songId: 'song-easter-1', title: 'Christ the Lord Is Risen Today', key: 'G', timeSig: '4/4', tempo: '120', performer: 'Choir' },
      kyrie: { songId: 'song-kyrie-1', title: 'Lord, Have Mercy', key: 'D', timeSig: '4/4', tempo: '100', performer: 'Choir' },
      gloria: { songId: 'song-gloria-1', title: 'Glory to God', key: 'D', timeSig: '4/4', tempo: '100', performer: 'Choir' },
      psalm: { songId: 'song-psalm-118', title: 'Psalm 118: 1-2, 16-17, 22-23', key: 'G', timeSig: '4/4', tempo: '80', performer: 'Cantor' },
      gospel_acclamation: { songId: 'song-alleluia-1', title: 'Alleluia', key: 'G', timeSig: '3/4', tempo: '100', performer: 'Choir' },
      offertory: { songId: 'song-offertory-king', title: 'The King of Love My Shepherd Is', key: 'G', timeSig: '4/4', tempo: '96', performer: 'Choir' },
      sanctus: { songId: 'song-sanctus-1', title: 'Holy, Holy, Holy', key: 'F', timeSig: '4/4', tempo: '112', performer: 'Choir' },
      memorial_acclamation: { songId: 'song-memorial-1', title: 'We Proclaim Your Death, O Lord', key: 'D', timeSig: '4/4', tempo: '76', performer: 'Choir' },
      great_amen: { songId: 'song-amen-1', title: 'Amen', key: 'D', timeSig: '3/4', tempo: '76', performer: 'Choir' },
      agnus_dei: { songId: 'song-agnus-1', title: 'Lamb of God', key: 'G', timeSig: '3/4', tempo: '72', performer: 'Choir' },
      communion: { songId: 'song-communion-bread', title: 'I Am the Bread of Life', key: 'G', timeSig: '4/4', tempo: '96', performer: 'Choir' },
      thanksgiving: { songId: 'song-thanks-now', title: 'Now Thank We All Our God', key: 'G', timeSig: '4/4', tempo: '100', performer: 'Choir' },
      recessional: { songId: 'song-recessional-easter', title: 'Jesus Christ Is Risen Today', key: 'G', timeSig: '4/4', tempo: '120', performer: 'Choir' }
    }
  },
  {
    id: 'arr-2025-06-01',
    massId: 'mass-2025-06-01',
    massDate: '2025-06-01',
    massDisplayDate: 'Sun, 1 Jun 2025',
    massTitle: 'Pentecost Sunday',
    groupId: 'grp-youth-choir',
    groupName: 'Youth Choir',
    status: 'submitted',
    submittedAt: '2025-05-28T16:00:00Z',
    reviewedAt: null,
    approvedAt: null,
    reviewedBy: null,
    coordinatorNotes: '',
    songs: {
      entrance: { songId: 'song-easter-1', title: 'Come Holy Ghost, Creator Blest', key: 'F', timeSig: '4/4', tempo: '104', performer: 'Youth Choir' },
      kyrie: { songId: 'song-kyrie-1', title: 'Lord, Have Mercy', key: 'D', timeSig: '4/4', tempo: '100', performer: 'Youth Choir' },
      gloria: { songId: 'song-gloria-1', title: 'Glory to God', key: 'D', timeSig: '4/4', tempo: '100', performer: 'Youth Choir' },
      psalm: { songId: 'song-psalm-118', title: 'Psalm 104: Lord, Send Out Your Spirit', key: 'C', timeSig: '4/4', tempo: '84', performer: 'Cantor' },
      gospel_acclamation: { songId: 'song-alleluia-1', title: 'Alleluia', key: 'G', timeSig: '3/4', tempo: '100', performer: 'Youth Choir' },
      offertory: { songId: 'song-offertory-king', title: 'Spirit of the Living God', key: 'F', timeSig: '4/4', tempo: '80', performer: 'Youth Choir' },
      sanctus: { songId: 'song-sanctus-1', title: 'Holy, Holy, Holy', key: 'F', timeSig: '4/4', tempo: '112', performer: 'Youth Choir' },
      memorial_acclamation: { songId: 'song-memorial-1', title: 'We Proclaim Your Death, O Lord', key: 'D', timeSig: '4/4', tempo: '76', performer: 'Youth Choir' },
      great_amen: { songId: 'song-amen-1', title: 'Amen', key: 'D', timeSig: '3/4', tempo: '76', performer: 'Youth Choir' },
      agnus_dei: { songId: 'song-agnus-1', title: 'Lamb of God', key: 'G', timeSig: '3/4', tempo: '72', performer: 'Youth Choir' },
      communion: { songId: 'song-communion-bread', title: 'I Am the Bread of Life', key: 'G', timeSig: '4/4', tempo: '96', performer: 'Youth Choir' },
      thanksgiving: { songId: 'song-thanks-now', title: 'Now Thank We All Our God', key: 'G', timeSig: '4/4', tempo: '100', performer: 'Youth Choir' },
      recessional: { songId: 'song-recessional-easter', title: 'Holy God, We Praise Thy Name', key: 'F', timeSig: '3/4', tempo: '100', performer: 'Youth Choir' }
    }
  },
  // Archived Arrangement for Christ the King 2024
  {
    id: 'arr-2024-11-24',
    massId: 'mass-2024-11-24',
    massDate: '2024-11-24',
    massDisplayDate: 'Sun, 24 Nov 2024',
    massTitle: 'Solemnity of Christ the King',
    groupId: 'grp-school-choir',
    groupName: 'School Choir',
    status: 'approved',
    submittedAt: '2024-11-18T14:00:00Z',
    reviewedAt: '2024-11-19T10:00:00Z',
    approvedAt: '2024-11-20T12:00:00Z',
    reviewedBy: 'Mr. Gabriel Mensah (Music Coordinator)',
    coordinatorNotes: 'Grand solemnity with brass quintet.',
    songs: {
      entrance: { songId: 'song-easter-1', title: 'All Creatures of Our God and King', key: 'D', timeSig: '3/4', tempo: '108', performer: 'Combined Choir' },
      kyrie: { songId: 'song-kyrie-1', title: 'Lord, Have Mercy', key: 'D', timeSig: '4/4', tempo: '100', performer: 'Choir' },
      gloria: { songId: 'song-gloria-1', title: 'Glory to God', key: 'D', timeSig: '4/4', tempo: '100', performer: 'Choir' },
      psalm: { songId: 'song-psalm-118', title: 'Psalm 93: The Lord Is King', key: 'G', timeSig: '4/4', tempo: '84', performer: 'Cantor' },
      gospel_acclamation: { songId: 'song-alleluia-1', title: 'Alleluia', key: 'G', timeSig: '3/4', tempo: '100', performer: 'Choir' },
      offertory: { songId: 'song-offertory-king', title: 'The King of Love My Shepherd Is', key: 'G', timeSig: '4/4', tempo: '96', performer: 'Choir' },
      sanctus: { songId: 'song-sanctus-1', title: 'Holy, Holy, Holy', key: 'F', timeSig: '4/4', tempo: '112', performer: 'Choir' },
      memorial_acclamation: { songId: 'song-memorial-1', title: 'We Proclaim Your Death, O Lord', key: 'D', timeSig: '4/4', tempo: '76', performer: 'Choir' },
      great_amen: { songId: 'song-amen-1', title: 'Amen', key: 'D', timeSig: '3/4', tempo: '76', performer: 'Choir' },
      agnus_dei: { songId: 'song-agnus-1', title: 'Lamb of God', key: 'G', timeSig: '3/4', tempo: '72', performer: 'Choir' },
      communion: { songId: 'song-communion-bread', title: 'I Am the Bread of Life', key: 'G', timeSig: '4/4', tempo: '96', performer: 'Choir' },
      thanksgiving: { songId: 'song-thanks-now', title: 'Now Thank We All Our God', key: 'G', timeSig: '4/4', tempo: '100', performer: 'Choir' },
      recessional: { songId: 'song-recessional-easter', title: 'Jesus Christ Is Risen Today', key: 'G', timeSig: '4/4', tempo: '120', performer: 'Choir' }
    }
  }
];

const USER_ROLES = [
  { id: 'group', title: 'Faith Mensah', subtitle: 'Music Group Member', icon: '🎵', badge: 'Music Group' },
  { id: 'coordinator', title: 'Mr. Gabriel Mensah', subtitle: 'Music Coordinator', icon: '📋', badge: 'Coordinator' },
  { id: 'chaplain', title: 'Fr. Emmanuel K. Aidoo', subtitle: 'School Chaplain', icon: '✝️', badge: 'Chaplain' },
  { id: 'student', title: 'Emmanuel Tetteh', subtitle: 'Choir Member', icon: '📱', badge: 'Member' },
  { id: 'admin', title: 'Administrator', subtitle: 'System Admin', icon: '⚙️', badge: 'Admin' }
];
