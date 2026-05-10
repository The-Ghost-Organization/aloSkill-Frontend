export interface Book {
  id: string;
  title: string;
  author: string;
  authorBio: string;
  genre: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  cover: string;
  description: string;
  longDescription: string;
  publishedYear: number;
  pages: number;
  language: string;
  isbn: string;
  tags: string[];
  availability: "in-stock" | "limited" | "out-of-stock";
  bestseller?: boolean;
  newRelease?: boolean;
}

export const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Romance",
] as const;

export type Genre = (typeof GENRES)[number];

export const MAX_PRICE = 60;

export const books: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    authorBio:
      "Matt Haig is a British novelist and journalist, known for his award-winning books for both children and adults that explore themes of mental health and the human condition.",
    genre: "Fiction",
    price: 14.99,
    originalPrice: 19.99,
    rating: 4.7,
    reviewCount: 28450,
    cover: "https://picsum.photos/seed/book1/300/450",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever.",
    longDescription:
      "Somewhere out beyond the edge of the universe there is a library that contains an infinite number of books, each one the story of another reality. One tells the story of your life as it is, along with another book for the other life you could have lived if you had made a different choice at any point in your life. While we all wonder how our lives might have been, what if you had the chance to go to the library and see for yourself? Would any of these other lives truly be better?",
    publishedYear: 2020,
    pages: 304,
    language: "English",
    isbn: "978-0525559474",
    tags: ["philosophical", "emotional", "contemporary", "hopeful"],
    availability: "in-stock",
    bestseller: true,
  },
  {
    id: "2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    authorBio:
      "Andy Weir built a career as a software engineer until the success of The Martian allowed him to pursue writing full time. He is known for his scientifically accurate hard sci-fi stories.",
    genre: "Science Fiction",
    price: 16.99,
    rating: 4.9,
    reviewCount: 35120,
    cover: "https://picsum.photos/seed/book2/300/450",
    description:
      "A lone astronaut must save the earth from disaster in this propulsive science-based thriller.",
    longDescription:
      "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment or how to complete it. All he knows is that he's been asleep for a very, very long time. And he's just been awakened to find himself millions of miles from home, with nothing but two corpses for company.",
    publishedYear: 2021,
    pages: 476,
    language: "English",
    isbn: "978-0593135204",
    tags: ["space", "adventure", "hard-sci-fi", "survival"],
    availability: "in-stock",
    bestseller: true,
    newRelease: false,
  },
  {
    id: "3",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    authorBio:
      "Patrick Rothfuss is an American author of epic fantasy who teaches English at the University of Wisconsin–Stevens Point. The Kingkiller Chronicle is his debut series.",
    genre: "Fantasy",
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.8,
    reviewCount: 42300,
    cover: "https://picsum.photos/seed/book3/300/450",
    description:
      "The tale of Kvothe, from his childhood in a troupe of traveling players, to years spent as a near-feral orphan.",
    longDescription:
      "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen. The intimate narrative of his childhood in a troupe of traveling players, his years spent as a near-feral orphan in a crime-ridden city, his daringly brazen yet successful bid to enter a legendary school of magic, and his life-changing relationship with a top-ranking courtesan.",
    publishedYear: 2007,
    pages: 662,
    language: "English",
    isbn: "978-0756404079",
    tags: ["epic", "magic", "adventure", "coming-of-age"],
    availability: "in-stock",
  },
  {
    id: "4",
    title: "Atomic Habits",
    author: "James Clear",
    authorBio:
      "James Clear is an American author and speaker known for his work on habits, decision-making, and continuous improvement. His work has appeared in major publications worldwide.",
    genre: "Self-Help",
    price: 18.99,
    rating: 4.8,
    reviewCount: 85000,
    cover: "https://picsum.photos/seed/book4/300/450",
    description: "An easy and proven way to build good habits and break bad ones.",
    longDescription:
      "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results. If you're having trouble changing your habits, the problem isn't you. The problem is your system.",
    publishedYear: 2018,
    pages: 320,
    language: "English",
    isbn: "978-0735211292",
    tags: ["productivity", "psychology", "habits", "self-improvement"],
    availability: "in-stock",
    bestseller: true,
  },
  {
    id: "5",
    title: "Gone Girl",
    author: "Gillian Flynn",
    authorBio:
      "Gillian Flynn is an American author and former TV critic for Entertainment Weekly. Her dark psychological thrillers have been adapted into major Hollywood films.",
    genre: "Thriller",
    price: 13.99,
    rating: 4.1,
    reviewCount: 32100,
    cover: "https://picsum.photos/seed/book5/300/450",
    description: "A psychological thriller about the marriage between Nick Dunne and Amy Elliott.",
    longDescription:
      "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne's fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick's clever and beautiful wife disappears from their rented McMansion on the Mississippi River. Under mounting pressure from the police and media—as well as Amy's fiercely doting parents—the town golden boy parades an endless series of lies, deceits, and inappropriate behavior.",
    publishedYear: 2012,
    pages: 422,
    language: "English",
    isbn: "978-0307588371",
    tags: ["psychological", "suspense", "dark", "unreliable-narrator"],
    availability: "in-stock",
  },
  {
    id: "6",
    title: "Educated",
    author: "Tara Westover",
    authorBio:
      "Tara Westover is an American author who received her PhD from Cambridge University in 2014. She grew up in a strict survivalist family in Idaho and educated herself.",
    genre: "Biography",
    price: 15.99,
    rating: 4.7,
    reviewCount: 41200,
    cover: "https://picsum.photos/seed/book6/300/450",
    description:
      "A memoir about a young girl kept out of school who leaves her survivalist family to earn a PhD from Cambridge.",
    longDescription:
      "Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom. Her family was so isolated from mainstream society that there was no one to ensure the children received an education, and no one to intervene when one of Tara's older brothers became violent. When another brother got himself into college, Tara decided to try a new kind of life. Her quest for knowledge transformed her, taking her over oceans and across continents.",
    publishedYear: 2018,
    pages: 334,
    language: "English",
    isbn: "978-0399590504",
    tags: ["memoir", "inspiring", "family", "education"],
    availability: "in-stock",
    bestseller: true,
  },
  {
    id: "7",
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    authorBio:
      "Stieg Larsson was a Swedish journalist and writer best known for his Millennium series of crime thrillers. He passed away in 2004, before his books were published.",
    genre: "Mystery",
    price: 11.99,
    originalPrice: 14.99,
    rating: 4.4,
    reviewCount: 28900,
    cover: "https://picsum.photos/seed/book7/300/450",
    description:
      "A gripping mystery about a disgraced journalist and a brilliant hacker working to solve a family mystery.",
    longDescription:
      "Harriet Vanger, a scion of one of Sweden's wealthiest families, disappeared over forty years ago. All these years later, her aged uncle continues to seek the truth. He hires Mikael Blomkvist, a crusading journalist recently trapped by a libel conviction, to investigate. She is aided by the piercing intelligence of Lisbeth Salander, a twenty-four-year-old, pierced and tattooed genius hacker possessed of the hard-earned wisdom of someone twice her age.",
    publishedYear: 2005,
    pages: 672,
    language: "English",
    isbn: "978-0307454546",
    tags: ["detective", "scandal", "nordic-noir", "hacker"],
    availability: "in-stock",
  },
  {
    id: "8",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    authorBio:
      "Yuval Noah Harari is an Israeli public intellectual, historian and professor at the Hebrew University of Jerusalem. He is a bestselling author and global thought leader.",
    genre: "History",
    price: 17.99,
    rating: 4.6,
    reviewCount: 56700,
    cover: "https://picsum.photos/seed/book8/300/450",
    description:
      "A bold and provocative tour through human history asking the biggest questions about us.",
    longDescription:
      "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms? How did we come to believe in gods, nations and human rights? To trust money, books and laws? And what will our world look like in the millennia to come?",
    publishedYear: 2011,
    pages: 443,
    language: "English",
    isbn: "978-0062316097",
    tags: ["history", "anthropology", "evolution", "civilization"],
    availability: "in-stock",
    bestseller: true,
  },
  {
    id: "9",
    title: "The Alchemist",
    author: "Paulo Coelho",
    authorBio:
      "Paulo Coelho is a Brazilian lyricist and novelist and is one of the most widely read authors in the world today, with over 225 million copies sold worldwide.",
    genre: "Fiction",
    price: 10.99,
    rating: 4.3,
    reviewCount: 71200,
    cover: "https://picsum.photos/seed/book9/300/450",
    description:
      "A magical story about following your dreams and finding treasure where you least expect it.",
    longDescription:
      "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined. Santiago's journey teaches us about the essential wisdom of listening to our hearts, of recognizing opportunity and learning to read the omens strewn along life's path.",
    publishedYear: 1988,
    pages: 208,
    language: "English",
    isbn: "978-0062315007",
    tags: ["inspirational", "spiritual", "classic", "journey"],
    availability: "in-stock",
  },
  {
    id: "10",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    authorBio:
      "Jane Austen was an English novelist known primarily for her six major novels which critique and comment upon the British landed gentry at the end of the 18th century.",
    genre: "Romance",
    price: 8.99,
    rating: 4.6,
    reviewCount: 43500,
    cover: "https://picsum.photos/seed/book10/300/450",
    description:
      "The story of the Bennet family and the romantic entanglement between Elizabeth and the enigmatic Mr. Darcy.",
    longDescription:
      "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work 'her own darling child' and its vivacious heroine, Elizabeth Bennet, 'as delightful a creature as ever appeared in print.' It is a truth universally acknowledged that this book is one of the greatest love stories ever written.",
    publishedYear: 1813,
    pages: 432,
    language: "English",
    isbn: "978-0141439518",
    tags: ["classic", "regency", "wit", "social-commentary"],
    availability: "in-stock",
  },
  {
    id: "11",
    title: "Dune",
    author: "Frank Herbert",
    authorBio:
      "Frank Herbert was an American science fiction author best known for the novel Dune and its five sequels. Dune is the best-selling science fiction novel of all time.",
    genre: "Science Fiction",
    price: 15.99,
    originalPrice: 19.99,
    rating: 4.7,
    reviewCount: 52300,
    cover: "https://picsum.photos/seed/book11/300/450",
    description:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family.",
    longDescription:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness. Coveted across the known universe, melange is a prize worth killing for. When House Atreides is betrayed, the destruction of Paul's family will set the boy on a journey toward a destiny greater than he could ever have imagined.",
    publishedYear: 1965,
    pages: 896,
    language: "English",
    isbn: "978-0441013593",
    tags: ["space-opera", "politics", "ecology", "prophecy"],
    availability: "in-stock",
    bestseller: true,
  },
  {
    id: "12",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    authorBio:
      "Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal, writing about finance and investing.",
    genre: "Non-Fiction",
    price: 17.49,
    rating: 4.7,
    reviewCount: 38900,
    cover: "https://picsum.photos/seed/book12/300/450",
    description: "Timeless lessons on wealth, greed, and happiness.",
    longDescription:
      "Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field. But in the real world, people don't make financial decisions on a spreadsheet. They make them at the dinner table, or in a meeting room, where personal history, unique world view, ego, pride, marketing, and odd incentives are scrambled together.",
    publishedYear: 2020,
    pages: 256,
    language: "English",
    isbn: "978-0857197689",
    tags: ["finance", "investing", "psychology", "wealth"],
    availability: "in-stock",
    bestseller: true,
  },
  {
    id: "13",
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    authorBio:
      "Sarah J. Maas is a New York Times, USA Today, and internationally bestselling author of the Crescent City, A Court of Thorns and Roses, and Throne of Glass series.",
    genre: "Fantasy",
    price: 14.49,
    rating: 4.5,
    reviewCount: 47800,
    cover: "https://picsum.photos/seed/book13/300/450",
    description:
      "A young huntress is captured by a faerie and discovers a world of dark magic and dangerous beauty.",
    longDescription:
      "Feyre's survival rests upon her ability to hunt and kill — the forest where she lives is a cold, bleak place in the long winter months. So when she spots a deer in the forest being pursued by a wolf, she cannot resist fighting it for the flesh. But to do so, she must kill the predator and killing something so precious comes at a price. She is taken to a treacherous magical land she only knows about from legends, where she discovers that her captor is not truly a beast, but one of the lethal, immortal faeries.",
    publishedYear: 2015,
    pages: 419,
    language: "English",
    isbn: "978-1619634459",
    tags: ["fae", "romance", "magic", "dark-fantasy"],
    availability: "in-stock",
  },
  {
    id: "14",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    authorBio:
      "Alex Michaelides is a British–Cypriot author and screenwriter whose debut novel The Silent Patient became a #1 New York Times bestseller.",
    genre: "Thriller",
    price: 13.49,
    rating: 4.3,
    reviewCount: 29400,
    cover: "https://picsum.photos/seed/book14/300/450",
    description:
      "A famous painter shoots her husband five times and then never speaks another word.",
    longDescription:
      "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word. Her refusal to talk, or give any kind of explanation, turns a domestic tragedy into something far grander, a mystery that captures the public imagination.",
    publishedYear: 2019,
    pages: 336,
    language: "English",
    isbn: "978-1250301697",
    tags: ["psychological", "mystery", "dark", "twisty"],
    availability: "in-stock",
  },
  {
    id: "15",
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    authorBio:
      "Douglas Adams was an English author, humorist, and dramatist best known for The Hitchhiker's Guide to the Galaxy, originally a BBC radio comedy.",
    genre: "Science Fiction",
    price: 11.49,
    rating: 4.6,
    reviewCount: 38700,
    cover: "https://picsum.photos/seed/book16/300/450",
    description:
      "Seconds before Earth is demolished for a hyperspace bypass, Arthur Dent is swept off the planet by his alien friend.",
    longDescription:
      "Seconds before the Earth is demolished to make way for a hyperspace bypass, Arthur Dent is swept off the planet by his friend Ford Prefect, a researcher for the revised edition of The Hitchhiker's Guide to the Galaxy who, for the last fifteen years, has been posing as an out-of-work actor. Together this unlikely pair begin a journey through the universe aided by a wholly remarkable book and a depressed robot named Marvin.",
    publishedYear: 1979,
    pages: 224,
    language: "English",
    isbn: "978-0345391803",
    tags: ["comedy", "satire", "absurdist", "adventure"],
    availability: "in-stock",
  },
  {
    id: "16",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    authorBio:
      "Walter Isaacson is an American author, journalist, and professor who has written bestselling biographies of Albert Einstein, Benjamin Franklin, and Leonardo da Vinci.",
    genre: "Biography",
    price: 20.99,
    originalPrice: 25.99,
    rating: 4.5,
    reviewCount: 33200,
    cover: "https://picsum.photos/seed/book17/300/450",
    description:
      "The exclusive biography of Steve Jobs, based on over forty interviews conducted with his full cooperation.",
    longDescription:
      "Based on more than forty interviews with Jobs conducted over two years—as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries: personal computers, animated movies, music, phones, tablet computing, and digital publishing.",
    publishedYear: 2011,
    pages: 630,
    language: "English",
    isbn: "978-1451648539",
    tags: ["tech", "business", "inspiring", "innovation"],
    availability: "in-stock",
  },
  {
    id: "17",
    title: "Sapiens: A Brief History",
    author: "Yuval Noah Harari",
    authorBio:
      "Yuval Noah Harari is an Israeli historian and professor known for his ability to translate complex historical narratives into compelling, accessible prose.",
    genre: "Non-Fiction",
    price: 17.49,
    rating: 4.5,
    reviewCount: 29800,
    cover: "https://picsum.photos/seed/book21/300/450",
    description: "How did homo sapiens come to dominate the world? The answer will surprise you.",
    longDescription:
      "In Sapiens, Dr Yuval Noah Harari spans the whole of human history, from the very first humans to walk the earth to the radical — and sometimes devastating — breakthroughs of the Cognitive, Agricultural and Scientific Revolutions. Drawing on insights from biology, anthropology, palaeontology and economics, he explores how the currents of history have shaped our human societies, the animals and plants around us.",
    publishedYear: 2015,
    pages: 512,
    language: "English",
    isbn: "978-0771038518",
    tags: ["history", "science", "society", "evolution"],
    availability: "in-stock",
  },
  {
    id: "18",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    authorBio:
      "F. Scott Fitzgerald was an American novelist, essayist, short story writer, and screenwriter. He is best known for his novels depicting the flamboyance of the Jazz Age.",
    genre: "Fiction",
    price: 9.99,
    rating: 4.1,
    reviewCount: 55400,
    cover: "https://picsum.photos/seed/book22/300/450",
    description:
      "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    longDescription:
      "The story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted 'gin was the national drink and sex the national obsession.' It is an exquisitely crafted tale of America in the 1920s. Fitzgerald wrote in a letter that 'the whole burden of this novel' is about 'the loss of those illusions that give such color to the world so that you don't care whether things are true or false as long as they partake of the magical glory.'",
    publishedYear: 1925,
    pages: 180,
    language: "English",
    isbn: "978-0743273565",
    tags: ["classic", "jazz-age", "american-dream", "tragedy"],
    availability: "in-stock",
  },
  {
    id: "19",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    authorBio:
      "Napoleon Hill was an American self-help author and lecturer who spent over twenty years interviewing successful industrialists to understand the secrets of their success.",
    genre: "Self-Help",
    price: 9.99,
    rating: 4.4,
    reviewCount: 62000,
    cover: "https://picsum.photos/seed/book18/300/450",
    description:
      "Drawing on the stories of Andrew Carnegie, Thomas Edison, Henry Ford, and other millionaires of the era.",
    longDescription:
      "Think and Grow Rich has been called the 'Granddaddy of All Motivational Literature.' It was the first book to boldly ask, 'What makes a winner?' Napoleon Hill researched more than forty millionaires to find out what made them who they were. Among the 13 principles of success Hill distilled: the power of the mastermind alliance, the mystery of sex transmutation, and the true nature of the sixth sense.",
    publishedYear: 1937,
    pages: 233,
    language: "English",
    isbn: "978-0449214923",
    tags: ["success", "mindset", "classic", "wealth"],
    availability: "in-stock",
  },
  {
    id: "20",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    authorBio:
      "Mark Manson is an American self-help author, blogger, and entrepreneur whose unconventional approach to personal development has resonated with millions worldwide.",
    genre: "Self-Help",
    price: 14.99,
    rating: 4.3,
    reviewCount: 71500,
    cover: "https://picsum.photos/seed/book20/300/450",
    description: "A counterintuitive approach to living a good life by caring less about more.",
    longDescription:
      "In this generation-defining self-help guide, a superstar blogger cuts through the crap to show us how to stop trying to be 'positive' all the time so that we can truly become better, happier people. For decades, we've been told that positive thinking is the key to a happy, rich life. Mark Manson argues the key to well-being is not the relentless pursuit of positive experiences, but how we engage with negative experiences.",
    publishedYear: 2016,
    pages: 224,
    language: "English",
    isbn: "978-0062457714",
    tags: ["mindset", "philosophy", "unconventional", "happiness"],
    availability: "in-stock",
    bestseller: true,
  },
];
