export type ScaleQuestion = {
  type: 'scale';
  key: string;
  label: string;
  low: string;
  high: string;
};

export type BoolQuestion = {
  type: 'bool';
  key: string;
  label: string;
};

export type SubQuestion = ScaleQuestion | BoolQuestion;

export type SubCategory = {
  key: string;
  label: string;
  emoji: string;
  questions: SubQuestion[];
};

export const SUB_CATEGORIES: SubCategory[] = [
  {
    key: 'community',
    label: 'Community',
    emoji: '🤝',
    questions: [
      { type: 'scale', key: 'catan_probability', label: 'Probability of finding Catan players', low: 'Solo forever', high: 'Board game paradise' },
      { type: 'scale', key: 'monologue_length', label: 'Average length of monologues overheard', low: 'Quick tweet', high: 'Full TED talk' },
      { type: 'scale', key: 'weird_looks', label: 'Probability someone looks at you weirdly', low: 'Total acceptance', high: 'Maximum judgment' },
      { type: 'scale', key: 'stranger_therapy', label: 'Chances a stranger becomes your therapist', low: 'Mind their business', high: 'Free therapy session' },
      { type: 'scale', key: 'everyone_knows_each_other', label: 'How many people know each other already', low: 'All strangers', high: 'Everyone\'s cousins' },
    ],
  },
  {
    key: 'amenities',
    label: 'Amenities',
    emoji: '🛋️',
    questions: [
      { type: 'bool', key: 'sauna', label: 'Sauna is present' },
      { type: 'bool', key: 'nap_friendly', label: 'Can take a nap for a few hours' },
      { type: 'bool', key: 'free_food', label: 'Neighbors give out free food' },
      { type: 'scale', key: 'wifi', label: 'WiFi quality', low: 'Dial-up nostalgia', high: 'NASA bandwidth' },
      { type: 'scale', key: 'power_outlets', label: 'Power outlet availability', low: 'Bring a power bank', high: 'More outlets than people' },
    ],
  },
  {
    key: 'perks',
    label: 'Perks',
    emoji: '✨',
    questions: [
      { type: 'scale', key: 'unexpected_snacks', label: 'Probability of unexpected snacks appearing', low: 'Snack desert', high: 'Spontaneous buffet' },
      { type: 'scale', key: 'philosophical_debate', label: 'Likelihood of a philosophical debate breaking out', low: 'Small talk only', high: 'Nietzsche by midnight' },
      { type: 'bool', key: 'animals_visit', label: 'Animals (cats/dogs) visit regularly' },
      { type: 'scale', key: 'useless_knowledge', label: 'Chances of learning something completely useless', low: 'Nothing new', high: 'Left knowing 3 conspiracy theories' },
      { type: 'scale', key: 'novel_writers', label: 'Probability someone here is writing a novel', low: 'Just scrolling TikTok', high: 'Hemingway\'s ghost is present' },
    ],
  },
  {
    key: 'aesthetics',
    label: 'Aesthetics',
    emoji: '🎨',
    questions: [
      { type: 'scale', key: 'leather_jackets', label: 'How many people wear leather jackets', low: 'Zero cool', high: 'Biker convention' },
      { type: 'scale', key: 'cheek_tattoos', label: 'How many people have tattoos on their cheeks', low: 'None', high: 'It\'s a gallery' },
      { type: 'scale', key: 'max_shower_days', label: 'Max days without shower (estimated)', low: 'Fresh lavender', high: 'You can taste it' },
      { type: 'scale', key: 'vibe_era', label: 'What era does this place feel like?', low: '70s commune', high: 'Cyberpunk 2077' },
      { type: 'scale', key: 'outfit_drama', label: 'Overall outfit drama level', low: 'Pajamas acceptable', high: 'You underdressed in a tuxedo' },
    ],
  },
];

export const ALL_QUESTIONS: SubQuestion[] = SUB_CATEGORIES.flatMap((c) => c.questions);
