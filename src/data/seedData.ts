import { Actor, CastingCall } from '../types';

export const DEFAULT_ACTORS: Actor[] = [
  {
    id: 'act_1',
    name: 'Zuri Mwangi',
    type: 'both',
    gender: 'female',
    age: 25,
    heightCm: 173,
    eyeColor: 'dark brown',
    hairColor: 'black',
    hairLength: 'braids',
    ethnicity: 'East African',
    location: 'Nairobi, Kenya',
    bio: 'Zuri is an energetic screen actress and editorial model based in Nairobi. Known for her roles in Kenyan telenovelas and Pan-African commercial campaigns. Fluent in English, Swahili, and conversational French.',
    skills: ['Spoken Word', 'Traditional Dance', 'Vocal Performance', 'Yoga', 'Swimming'],
    languages: ['Swahili (Native)', 'English (Fluent)', 'French (Conversational)'],
    headshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'zuri.mwangi@studiocast.ke',
    phone: '+254 712 345678',
    instagram: '@zuri_mwangi_official',
    website: 'www.zurimwangi.co.ke',
    createdAt: '2026-01-15T08:00:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoTitle: 'Zuri Mwangi - Dramatic Showreel 2026',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioTitle: 'Zuri Mwangi - Swahili Voiceover Sample'
    },
    experience: [
      { id: 'exp_1_1', year: '2025', project: 'Siri Za Ndani', role: 'Amani (Lead)', production: 'Maisha Magic Series' },
      { id: 'exp_1_2', year: '2024', project: 'Nairobi Fashion Weekend', role: 'Showstopper Model', production: 'KICC Runway' },
      { id: 'exp_1_3', year: '2023', project: 'Under the Acacia', role: 'Wanjiku', production: 'Kenya National Theatre' }
    ]
  },
  {
    id: 'act_2',
    name: 'Tunde Bakare',
    type: 'actor',
    gender: 'male',
    age: 29,
    heightCm: 185,
    eyeColor: 'dark brown',
    hairColor: 'black',
    hairLength: 'short crop',
    ethnicity: 'West African',
    location: 'Lagos, Nigeria',
    bio: 'Tunde is a Nollywood method actor specializing in intense psychological thrillers and action-drama roles. Trained in Lagos and London. Highly skilled in dialects, physical theater, and hosting.',
    skills: ['Stage Combat', 'Monologues', 'Afrobeats Dancing', 'Driving (Manual/Stunt)', 'Voiceover'],
    languages: ['Yoruba (Native)', 'English (Fluent)', 'Pidgin (Fluent)'],
    headshotUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'tunde.bakare@nollywoodcast.ng',
    phone: '+234 803 111 2222',
    instagram: '@tunde_bakare_acts',
    website: 'www.tundebakare.ng',
    createdAt: '2026-02-10T10:30:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      videoTitle: 'Tunde Bakare - Action Reel 2026',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      audioTitle: 'Tunde Bakare - English Commercial VO Promo'
    },
    experience: [
      { id: 'exp_2_1', year: '2025', project: 'Eko Heist', role: 'Chidi (Co-lead)', production: 'Netflix Original Film' },
      { id: 'exp_2_2', year: '2024', project: 'The Red Dust', role: 'Inspector Femi (Lead)', production: 'Nollywood Drama' }
    ]
  },
  {
    id: 'act_3',
    name: 'Sipho Khumalo',
    type: 'both',
    gender: 'male',
    age: 27,
    heightCm: 188,
    eyeColor: 'brown',
    hairColor: 'black',
    hairLength: 'shaved',
    ethnicity: 'Southern African',
    location: 'Johannesburg, South Africa',
    bio: 'Sipho is an award-winning theatrical actor, singer (Baritone), and high-fashion runway model from Soweto. Possesses a powerful commanding presence. Highly experienced in musical theater and luxury campaigns.',
    skills: ['Baritone Singing', 'Acapella Harmony', 'Modern Jazz Dance', 'Martial Arts', 'Rugby'],
    languages: ['Zulu (Native)', 'English (Fluent)', 'Xhosa (Fluent)', 'Sotho (Conversational)'],
    headshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'sipho.khumalo@sa-talent.co.za',
    phone: '+27 82 555 4321',
    instagram: '@sipho_khumalo_official',
    createdAt: '2025-12-01T14:20:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoTitle: 'Sipho Khumalo - Monologue Reel',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      audioTitle: 'Sipho Khumalo - Deep Baritone Narrative VO'
    },
    experience: [
      { id: 'exp_3_1', year: '2025', project: 'Soweto Beats', role: 'Themba (Lead)', production: 'SA State Theatre Musical' },
      { id: 'exp_3_2', year: '2024', project: 'Johannesburg Couture', role: 'Principal Model', production: 'South African Fashion Week' },
      { id: 'exp_3_3', year: '2023', project: 'Rhythm of Gold', role: 'Dumisani', production: 'SABC 1 Series' }
    ]
  },
  {
    id: 'act_4',
    name: 'Elena Rostova',
    type: 'both',
    gender: 'female',
    age: 26,
    heightCm: 178,
    eyeColor: 'green',
    hairColor: 'blonde',
    hairLength: 'long',
    ethnicity: 'Eastern European',
    location: 'Cape Town, South Africa',
    bio: 'Elena is an international high-fashion model and dramatic actress now based in Cape Town. She has walked for European designers and starred in global cosmetics spots. Fluent in English, Czech, and French.',
    skills: ['Runway Walk', 'Piano (Advanced)', 'Tennis', 'Ice Skating'],
    languages: ['Czech (Native)', 'English (Fluent)', 'French (Fluent)'],
    headshotUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'elena.rostova@cape-models.co.za',
    phone: '+27 83 999 7777',
    instagram: '@elena_rostova',
    website: 'www.elenarostova.com',
    createdAt: '2026-03-01T11:15:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      videoTitle: 'Elena Rostova - Modeling Showreel 2026'
    },
    experience: [
      { id: 'exp_4_1', year: '2025', project: 'Ocean Mist Editorial', role: 'Lead Campaign Model', production: 'Cape Town Vogue' },
      { id: 'exp_4_2', year: '2024', project: 'Paris Fashion Week', role: 'Catwalk Model', production: 'Dior / Chanel' }
    ]
  },
  {
    id: 'act_5',
    name: 'Abenezer Yohannes',
    type: 'actor',
    gender: 'male',
    age: 31,
    heightCm: 180,
    eyeColor: 'dark brown',
    hairColor: 'black',
    hairLength: 'short curls',
    ethnicity: 'East African',
    location: 'Addis Ababa, Ethiopia',
    bio: 'Abenezer is a dramatic film and theater actor with strong classical training. Known for his intense eyes and emotive acting style. Renowned voice actor in national radio drama.',
    skills: ['Voice Mimicry', 'Acoustic Guitar', 'Poetry Performance', 'Marathon Running'],
    languages: ['Amharic (Native)', 'English (Fluent)', 'Tigrinya (Conversational)'],
    headshotUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'abenezer.yohannes@studiocast.et',
    phone: '+251 911 223344',
    instagram: '@abenezer_yoh_acts',
    createdAt: '2026-04-12T15:40:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoTitle: 'Abenezer Yohannes - Dramatic Showreel',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      audioTitle: 'Abenezer Yohannes - Amharic Narrative Voice Sample'
    },
    experience: [
      { id: 'exp_5_1', year: '2025', project: 'The Blue Nile', role: 'Yared (Lead)', production: 'Ethiopian Indie Cinema' },
      { id: 'exp_5_2', year: '2024', project: 'Solomon’s Wisdom', role: 'King Solomon', production: 'National Theatre of Ethiopia' }
    ]
  },
  {
    id: 'act_6',
    name: 'Yasmine Mansour',
    type: 'model',
    gender: 'female',
    age: 23,
    heightCm: 176,
    eyeColor: 'brown',
    hairColor: 'black',
    hairLength: 'bob cut',
    ethnicity: 'North African',
    location: 'Cairo, Egypt',
    bio: 'Yasmine is a striking alternative fashion and beauty model. Known for editorial, street-style, and luxury makeup spots in Cairo and Dubai. Fluent in Arabic and English.',
    skills: ['Contemporary Walk', 'Graphic Design', 'Drawing', 'Horseback Riding'],
    languages: ['Arabic (Native)', 'English (Fluent)'],
    headshotUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'yasmine.mansour@cairomodels.eg',
    phone: '+20 100 123 4567',
    instagram: '@yasmine_mansour_alt',
    createdAt: '2026-05-18T09:12:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      videoTitle: 'Yasmine Mansour - Cairo Runway Compilation'
    },
    experience: [
      { id: 'exp_6_1', year: '2025', project: 'Giza Sands Editorial', role: 'Hero Beauty Model', production: 'Marie Claire Arabia' },
      { id: 'exp_6_2', year: '2025', project: 'Cairo Fashion Week', role: 'Catwalk Model', production: 'Samaa Agency' }
    ]
  },
  {
    id: 'act_7',
    name: 'Kofi Mensah',
    type: 'actor',
    gender: 'male',
    age: 35,
    heightCm: 183,
    eyeColor: 'dark brown',
    hairColor: 'black',
    hairLength: 'locs',
    ethnicity: 'West African',
    location: 'Accra, Ghana',
    bio: 'Kofi is an expressive comic and dramatic actor based in Accra. Famous for his versatility in satirical films, high-energy theater plays, and commercial voiceovers. Fluent in English, Twi, and Ga.',
    skills: ['Stand-up Comedy', 'Afrobeats Percussion', 'Improv', 'Stage Directing'],
    languages: ['Twi (Native)', 'English (Fluent)', 'Ga (Conversational)'],
    headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'kofi.mensah@ghperformers.com',
    phone: '+233 24 123 4567',
    instagram: '@kofi_mensah_funny',
    createdAt: '2026-01-20T16:00:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoTitle: 'Kofi Mensah - Comedy Reel 2026',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      audioTitle: 'Kofi Mensah - Twi Radio Voiceover Sample'
    },
    experience: [
      { id: 'exp_7_1', year: '2025', project: 'Accra Taxi Driver', role: 'Kwame (Lead)', production: 'Silverbird Cinemas Feature' },
      { id: 'exp_7_2', year: '2024', project: 'The Chief’s Council', role: 'Elder Mensah', production: 'Ghana National Theatre' }
    ]
  },
  {
    id: 'act_8',
    name: 'Aminata Diallo',
    type: 'both',
    gender: 'female',
    age: 28,
    heightCm: 174,
    eyeColor: 'brown',
    hairColor: 'black',
    hairLength: 'short afro',
    ethnicity: 'West African',
    location: 'Dakar, Senegal',
    bio: 'Aminata is a bilingual dramatic actress and editorial model based in Dakar. Highly experienced in French-Senegalese co-productions and West African lifestyle modeling. Speaks French, Wolof, and English.',
    skills: ['Traditional Senegal Dance', 'Singing (Soprano)', 'Baking', 'Flute'],
    languages: ['Wolof (Native)', 'French (Fluent)', 'English (Conversational)'],
    headshotUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=600&q=80',
    contactEmail: 'aminata.diallo@dakarcast.sn',
    phone: '+221 77 123 4567',
    instagram: '@aminata_dakar_model',
    createdAt: '2026-02-28T13:45:00Z',
    mediaReels: {
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      videoTitle: 'Aminata Diallo - French Monologue Showcase'
    },
    experience: [
      { id: 'exp_8_1', year: '2025', project: 'Dakar Nights', role: 'Mariama (Lead)', production: 'Canal+ Afrique Series' },
      { id: 'exp_8_2', year: '2024', project: 'Sahel Sun Collection', role: 'Lead Runway Model', production: 'Dakar Fashion Week' }
    ]
  }
];

export const DEFAULT_CASTING_CALLS: CastingCall[] = [
  {
    id: 'call_1',
    title: 'Eko Heist: Part 2',
    company: 'Nollywood Prime Studios',
    director: 'Kemi Adetiba',
    description: 'The explosive sequel to the hit Lagos bank heist drama. Follows a highly intelligent ring of local street hackers, master lockpickers, and security insiders trying to orchestrate an impossible gold vault robbery on Lagos Island.',
    location: 'Lagos, Nigeria',
    type: 'film',
    dateCreated: '2026-07-10T09:00:00Z',
    deadline: '2026-08-15',
    budget: '₦ 150,000 - ₦ 300,000 / Day',
    currency: '₦',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&h=400&q=80',
    roles: [
      {
        id: 'role_1_1',
        title: 'Chidi - Master Hacker (Lead)',
        gender: 'male',
        ageMin: 24,
        ageMax: 35,
        description: 'A brilliant but highly reckless cybersecurity mastermind from Lagos Island. Charismatic, fast-talking, with immense emotional intensity. Must be comfortable speaking Pidgin and fluent English.',
        compensation: '₦ 300,000 / Day',
        sidesText: 'CHIDI: "You think security is about passwords? Please. Security is about greed. Show me a banker who wants a bigger car, and I will show you a vault door that is already wide open. We do not hack the servers, my friend. We hack the human beings. Now, are you in or are you going to sit there counting pennies?"'
      },
      {
        id: 'role_1_2',
        title: 'Amina - Undercover Coordinator (Supporting)',
        gender: 'female',
        ageMin: 23,
        ageMax: 32,
        description: 'An elegant corporate spy working inside the vault bank. Methodical, high-IQ, sophisticated, but with a highly protective street background. Understated, calm intensity.',
        compensation: '₦ 150,000 / Day',
        sidesText: 'AMINA: "Look at this floor plan. Every camera has a five-second blind spot during the rotation shift. Five seconds is all we need to bypass the biometrics. If any of you panics, if any of you so much as breathes too loudly, we are going to spend the next thirty years in Kirikiri. Do we understand each other?"'
      }
    ]
  },
  {
    id: 'call_2',
    title: 'Safaricom Savanna Campaign',
    company: 'East Africa Creative Collective',
    director: 'Zihan Al-Husseini',
    description: 'An expansive television commercial and digital outdoor campaign for East Africa’s largest telecommunication provider. Spotlighting sustainable technological expansion into farming and remote safari lands. Shoots in Nairobi and Rift Valley.',
    location: 'Nairobi, Kenya',
    type: 'commercial',
    dateCreated: '2026-07-15T11:00:00Z',
    deadline: '2026-08-05',
    budget: 'KSh 40,000 - KSh 80,000 / Day',
    currency: 'KSh',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&h=400&q=80',
    roles: [
      {
        id: 'role_2_1',
        title: 'Savanna Tech Farmer (Male/Female)',
        gender: 'all',
        ageMin: 22,
        ageMax: 35,
        description: 'A modern, tech-forward agriculturalist who utilizes smart mobile solutions. Warm, cheerful, energetic, and deeply authentic presence. Fluent Swahili is an absolute requirement.',
        compensation: 'KSh 50,000 / Day',
        sidesText: 'FARMER: "Hapa ndipo teknolojia inakutana na ardhi. Kupitia simu yangu, sasa najua soko linataka nini kabla hata sijaingia shambani. Huu si uchawi—hii ni nguvu ya mtandao unaotuunganisha sote. Jaribu sasa, uone jinsi tunavyobadilisha maisha!"'
      }
    ]
  },
  {
    id: 'call_3',
    title: 'The Table Mountain Syndicate',
    company: 'Cape Town Film Circuit',
    director: 'Neill Blomkamp',
    description: 'An upcoming dystopian sci-fi drama set in Cape Town 50 years into the future. Highlights the gap between mountain elites and underground dwellers. High-action production utilizing cutting-edge LED stages and heavy CGI environments.',
    location: 'Johannesburg, South Africa',
    type: 'tv',
    dateCreated: '2026-07-05T10:00:00Z',
    deadline: '2026-08-20',
    budget: 'R 6,000 - R 12,000 / Day',
    currency: 'R',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=400&q=80',
    roles: [
      {
        id: 'role_3_1',
        title: 'Commander Dumisani - Rebel General (Lead)',
        gender: 'male',
        ageMin: 25,
        ageMax: 38,
        description: 'A high-impact rebellious field leader with imposing physical presence. Charismatic, protective of his squad, and heavily involved in physical combat scenes. Comfort with fight choreography and Zulu vocal chants a plus.',
        compensation: 'R 12,000 / Day',
        sidesText: 'DUMISANI: "Look at them up there in their glass towers, drinking clean water while we breathe in the toxic sulfur of the lowlands. They think they can fence off the mountain? This is South Africa. This land belongs to the people who sweat for it, who bleed for it. Today, we take down that gate!"'
      }
    ]
  },
  {
    id: 'call_4',
    title: 'African Rhythm & Blues stage play',
    company: 'Accra National Theatre Company',
    director: 'Robert Miller',
    description: 'An intimate musical and dramatic production charting three generations of a high-life musical family returning to Accra. Strong vocal delivery, classic high-life dance skills, and powerful monologue deliveries are core.',
    location: 'Accra, Ghana',
    type: 'theater',
    dateCreated: '2026-07-18T14:30:00Z',
    deadline: '2026-09-01',
    budget: 'GH₵ 2,500 - GH₵ 5,000 / Week',
    currency: 'GH₵',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&h=400&q=80',
    roles: [
      {
        id: 'role_4_1',
        title: 'Uncle Kwame - Family High-Life Legend (Lead)',
        gender: 'male',
        ageMin: 45,
        ageMax: 65,
        description: 'The guitar-playing elder of the musical family dealing with modern shifts. Gentle, witty, soulful voice, with a highly theatrical storyteller persona. Speaks conversational Twi.',
        compensation: 'GH₵ 5,000 / Week',
        sidesText: 'KWAME: "They call it modern beats, but if you listen closely, you can still hear the pulse of the old high-life. The guitar never lies, my child. It speaks what the tongue is too afraid to say. Sit down. Let me teach you how to make a wooden box sing."'
      }
    ]
  }
];
