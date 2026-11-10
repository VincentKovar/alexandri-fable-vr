/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GutenbergBook {
  id: string;
  title: string;
  author: string;
  year: number;
  gutenbergId: number;
  coverUrl: string;
  shelfTier: number; // 0: Top, 1: Middle, 2: Bottom
  shelfPosition: number; // 0, 1, 2, 3
  spineColor: string;
  accentColor: string;
  description: string;
  pages: string[];
}

export const GUTENBERG_LIBRARY_DATA: GutenbergBook[] = [
  {
    id: "frankenstein",
    title: "Frankenstein; or, The Modern Prometheus",
    author: "Mary Wollstonecraft Shelley",
    year: 1818,
    gutenbergId: 84,
    coverUrl: "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
    shelfTier: 0,
    shelfPosition: 0,
    spineColor: "#1c2b2d",
    accentColor: "#8fb9a8",
    description: "A gothic tale of scientific ambition, the spark of life, and tragic consequence.",
    pages: [
      "Letter 1\n\nTo Mrs. Saville, England.\nSt. Petersburgh, Dec. 11th, 17—\n\nYou will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.",
      "I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes.",
      "Inspirited by this wind of promise, my daydreams become more fervent and vivid. I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight. There, Margaret, the sun is for ever visible, its broad disk just skirting the horizon.",
      "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out.",
      "By the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs. How can I describe my emotions at this catastrophe, or how delineate the wretch whom with such infinite pains and care I had endeavoured to form?",
      "His limbs were in proportion, and I had selected his features as beautiful. Beautiful! Great God! His yellow skin scarcely covered the work of muscles and arteries beneath; his hair was of a lustrous black, and flowing; his teeth of a pearly whiteness; but these luxuriances only formed a more horrid contrast with his watery eyes."
    ]
  },
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
    gutenbergId: 1342,
    coverUrl: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    shelfTier: 0,
    shelfPosition: 1,
    spineColor: "#3d1e2f",
    accentColor: "#e0a96d",
    description: "The timeless romantic comedy of Elizabeth Bennet and Fitzwilliam Darcy navigating societal expectations.",
    pages: [
      "Chapter 1\n\nIt is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      "\"My dear Mr. Bennet,\" said his lady to him one day, \"have you heard that Netherfield Park is let at last?\"\n\nMr. Bennet replied that he had not.\n\n\"But it is,\" returned she; \"for Mrs. Long has just been here, and she told me all about it.\"\n\nMr. Bennet made no answer.",
      "\"Do you not want to know who has taken it?\" cried his wife impatiently.\n\n\"You want to tell me, and I have no objection to hearing it.\"\n\nThis was invitation enough.\n\n\"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place.\"",
      "\"What is his name?\"\n\n\"Bingley.\"\n\n\"Is he married or single?\"\n\n\"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!\"\n\n\"How so? How can it affect them?\"\n\n\"My dear Mr. Bennet,\" replied his wife, \"how can you be so tiresome! You must know that I am thinking of his marrying one of them.\""
    ]
  },
  {
    id: "great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    gutenbergId: 64317,
    coverUrl: "https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg",
    shelfTier: 0,
    shelfPosition: 2,
    spineColor: "#112233",
    accentColor: "#ffd700",
    description: "The Jazz Age masterpiece of unrequited love, opulence, and the elusive American Dream in Long Island.",
    pages: [
      "Chapter 1\n\nIn my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.\n\n\"Whenever you feel like criticizing any one,\" he told me, \"just remember that all the people in this world haven't had the advantages that you've had.\"",
      "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.",
      "And as I sat there brooding on the old, unknown world, I thought of Gatsby's wonder when he first picked out the green light at the end of Daisy's dock. He had come a long way to this blue lawn, and his dream must have seemed so close that he could hardly fail to grasp it.",
      "He did not know that it was already behind him, somewhere back in that vast obscurity beyond the city, where the dark fields of the republic rolled on under the night.\n\nGatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—to-morrow we will run faster, stretch out our arms farther. . . . And one fine morning——\n\nSo we beat on, boats against the current, borne back ceaselessly into the past."
    ]
  },
  {
    id: "alice-in-wonderland",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    year: 1865,
    gutenbergId: 11,
    coverUrl: "https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg",
    shelfTier: 0,
    shelfPosition: 3,
    spineColor: "#4a1c17",
    accentColor: "#e6b0aa",
    description: "A whimsical journey through a fantastical realm filled with peculiar creatures, riddles, and tea parties.",
    pages: [
      "Chapter 1 — Down the Rabbit-Hole\n\nAlice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \"and what is the use of a book,\" thought Alice \"without pictures or conversations?\"",
      "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
      "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, \"Oh dear! Oh dear! I shall be late!\" but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it.",
      "Burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge. In another moment down went Alice after it, never once considering how in the world she was to get out again."
    ]
  },
  {
    id: "moby-dick",
    title: "Moby Dick; or, The Whale",
    author: "Herman Melville",
    year: 1851,
    gutenbergId: 2701,
    coverUrl: "https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg",
    shelfTier: 1,
    shelfPosition: 0,
    spineColor: "#1a3644",
    accentColor: "#79c2d0",
    description: "Captain Ahab's obsessive quest for vengeance against the white leviathan across stormy seas.",
    pages: [
      "Chapter 1 — Loomings\n\nCall me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
      "It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet;",
      "and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.",
      "There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land."
    ]
  },
  {
    id: "the-time-machine",
    title: "The Time Machine",
    author: "H.G. Wells",
    year: 1895,
    gutenbergId: 35,
    coverUrl: "https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg",
    shelfTier: 1,
    shelfPosition: 1,
    spineColor: "#2e2532",
    accentColor: "#d4a373",
    description: "The pioneering science-fiction voyage into the distant year 802,701 AD to encounter the Eloi and Morlocks.",
    pages: [
      "Chapter 1\n\nThe Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.",
      "The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses. Our chairs, being his patents, embraced and caressed us rather than submitted to be sat upon;",
      "and there was that luxurious after-dinner atmosphere when thought roams gracefully free of the trammels of precision. And he put it to us in this way—marking the points with a lean forefinger—as we sat and lazily admired his earnestness over this new paradox (as we thought it) and his fecundity.",
      "\"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception.\"\n\n\"Is not that rather a large thing to expect us to begin upon?\" said Filby, an argumentative person with red hair."
    ]
  },
  {
    id: "dracula",
    title: "Dracula",
    author: "Bram Stoker",
    year: 1897,
    gutenbergId: 345,
    coverUrl: "https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg",
    shelfTier: 1,
    shelfPosition: 2,
    spineColor: "#361313",
    accentColor: "#d90429",
    description: "The epistolary vampire gothic horror chronicle of Jonathan Harker, Mina Murray, and Count Dracula.",
    pages: [
      "Chapter 1 — Jonathan Harker's Journal\n\n3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could see from the streets.",
      "The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.",
      "4 May.—I found that my landlord had got a letter from the Count, directing him to secure the best place on the coach for me; but on making inquiries as to details he seemed somewhat reticent, and pretended that he could not understand my German.",
      "Welcome to my house! Enter freely and of your own will!\n\nHe made no motion of stepping to meet me, but stood like a statue, as though his gesture of welcome had fixed him into stone. The instant, however, that I had stepped over the threshold, he moved impulsively forward, and holding out his hand grasped mine with a strength which made me wince, an effect which was not lessened by the fact that it seemed as cold as ice—more like the hand of a dead than a living man."
    ]
  },
  {
    id: "sherlock-holmes",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    year: 1892,
    gutenbergId: 1661,
    coverUrl: "https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg",
    shelfTier: 1,
    shelfPosition: 3,
    spineColor: "#1d2a44",
    accentColor: "#f4a261",
    description: "Twelve quintessential detective mysteries of 221B Baker Street solved through deduction by Sherlock Holmes.",
    pages: [
      "I. A Scandal in Bohemia\n\nTo Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler.",
      "All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.",
      "He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.",
      "Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory."
    ]
  },
  {
    id: "war-and-peace",
    title: "War and Peace",
    author: "Leo Tolstoy",
    year: 1869,
    gutenbergId: 2600,
    coverUrl: "https://www.gutenberg.org/cache/epub/2600/pg2600.cover.medium.jpg",
    shelfTier: 2,
    shelfPosition: 0,
    spineColor: "#34281d",
    accentColor: "#cda34f",
    description: "Tolstoy's monumental historical panorama of Russian aristocratic families during the Napoleonic wars.",
    pages: [
      "Book One: 1805\n\nChapter I\n\n\"Well, Prince, so Genoa and Lucca are now just family estates of the Buonapartes. But I warn you, if you don't tell me that this means war, if you still try to defend the infamies and horrors perpetrated by that Antichrist—I really believe he is Antichrist—I will have nothing more to do with you and you are no longer my friend!\"",
      "It was in July, 1805, and the speaker was the well-known Anna Pavlovna Scherer, maid of honor and favorite of the Empress Marya Fedorovna. With these words she greeted Prince Vasili Kuragin, a man of high rank and importance, who was the first to arrive at her reception.",
      "Anna Pavlovna had had a cough for some days. She was, as she said, suffering from la grippe; grippe being then a new word in St. Petersburg, used only by the elite.",
      "All her invitations without exception, written in French, and delivered by a scarlet-liveried footman that morning, ran as follows:\n\n\"If you have nothing better to do, Count (or Prince), and if the prospect of spending an evening with a poor invalid is not too terrible, I shall be very charmed to see you tonight between 7 and 10—Annette Scherer.\""
    ]
  },
  {
    id: "tale-of-two-cities",
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    year: 1859,
    gutenbergId: 98,
    coverUrl: "https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg",
    shelfTier: 2,
    shelfPosition: 1,
    spineColor: "#25282a",
    accentColor: "#e63946",
    description: "The historical drama of London and Paris amidst the turmoil and terror of the French Revolution.",
    pages: [
      "Book the First—Recalled to Life\n\nChapter I. The Period\n\nIt was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness,",
      "it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way—in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.",
      "There were a king with a large jaw and a queen with a plain face, on the throne of England; there were a king with a large jaw and a queen with a fair face, on the throne of France. In both countries it was clearer than crystal to the lords of the State preserves of loaves and fishes, that things in general were settled for ever.",
      "It was the year of Our Lord one thousand seven hundred and seventy-five. Spiritual revelations were conceded to England at that favoured period, as at this. Mrs. Southcott had recently attained her five-and-twentieth blessed birthday, of whom a prophetic private in the Life Guards had heralded the sublime appearance by announcing that arrangements were made for the swallowing up of London and Westminster."
    ]
  },
  {
    id: "dorian-gray",
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    year: 1890,
    gutenbergId: 174,
    coverUrl: "https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg",
    shelfTier: 2,
    shelfPosition: 2,
    spineColor: "#202b20",
    accentColor: "#a3b18a",
    description: "The philosophical horror story of vanity, aestheticism, and a portrait bearing the sins of a youth.",
    pages: [
      "The Preface\n\nThe artist is the creator of beautiful things. To reveal art and conceal the artist is art's aim. The critic is he who can translate into another manner or a new material his impression of beautiful things.",
      "The highest as the lowest form of criticism is a mode of autobiography. Those who find ugly meanings in beautiful things are corrupt without being charming. This is a fault. Those who find beautiful meanings in beautiful things are the cultivated. For these there is hope.",
      "There is no such thing as a moral or an immoral book. Books are well written, or badly written. That is all. The nineteenth century dislike of Realism is the rage of Caliban seeing his own face in a glass.",
      "Chapter 1\n\nThe studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn."
    ]
  },
  {
    id: "metamorphosis",
    title: "The Metamorphosis",
    author: "Franz Kafka",
    year: 1915,
    gutenbergId: 5200,
    coverUrl: "https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg",
    shelfTier: 2,
    shelfPosition: 3,
    spineColor: "#3a2e2b",
    accentColor: "#f39c12",
    description: "Gregor Samsa wakes one morning transformed into an enormous monstrous insect.",
    pages: [
      "I\n\nOne morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.",
      "He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.",
      "His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \"What's happened to me?\" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.",
      "A collection of textile samples lay spread out on the table—Samsa was a travelling salesman—and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer."
    ]
  }
];

export interface ReaderState {
  selectedBookId: string | null;
  activeShelfTier: number | null;
  currentPageIndex: number;
  isOpen: boolean;
  isFlipping: boolean;
}

export function createInitialReaderState(): ReaderState {
  return {
    selectedBookId: null,
    activeShelfTier: null,
    currentPageIndex: 0,
    isOpen: false,
    isFlipping: false,
  };
}

export function getBookById(id: string): GutenbergBook | undefined {
  return GUTENBERG_LIBRARY_DATA.find((book) => book.id === id);
}

export function getBooksByTier(tier: number): GutenbergBook[] {
  return GUTENBERG_LIBRARY_DATA.filter((book) => book.shelfTier === tier);
}

export function getNextPageIndex(currentIndex: number, totalPages: number): number {
  if (currentIndex < totalPages - 1) {
    return currentIndex + 1;
  }
  return currentIndex;
}

export function getPrevPageIndex(currentIndex: number): number {
  if (currentIndex > 0) {
    return currentIndex - 1;
  }
  return 0;
}

export function computeShelfCoordinates(tier: number, position: number): { x: number; y: number; z: number } {
  // Shelf tiers: 0: top (y: 2.1), 1: mid (y: 1.3), 2: bottom (y: 0.5)
  // Shelf position: 4 books per shelf spanning x: -0.9 to +0.9
  const tierY = [2.2, 1.4, 0.6];
  const y = tierY[tier] ?? 1.4;
  const x = -0.75 + position * 0.5;
  const z = -1.8; // Front shelf line
  return { x, y, z };
}
