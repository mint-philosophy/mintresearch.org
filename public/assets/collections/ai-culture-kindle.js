function book(id, title, author, year, series, workId, sourceQuote, tags, source, sourceLabel) {
  return {
    id,
    title,
    author,
    year,
    ...(series ? { series } : {}),
    cover: `/assets/ai-culture/covers/${id}.webp`,
    source: source || `https://openlibrary.org/works/${workId}`,
    sourceLabel: sourceLabel || 'Open Library',
    sourceQuote,
    tags
  };
}

export const kindleScienceFictionSeries = {
  rifters: { title: 'Rifters', author: 'Peter Watts' },
  teixcalaan: { title: 'Teixcalaan', author: 'Arkady Martine' },
  'semiosis-trilogy': { title: 'Semiosis', author: 'Sue Burke' },
  'terra-ignota': { title: 'Terra Ignota', author: 'Ada Palmer' },
  'le-guin': { kind: 'Author', title: 'Ursula K. Le Guin' },
  'kim-stanley-robinson': { kind: 'Author', title: 'Kim Stanley Robinson' },
  'broken-earth': { title: 'The Broken Earth', author: 'N. K. Jemisin' },
  xenogenesis: { title: 'Xenogenesis / Lilith’s Brood', author: 'Octavia E. Butler' },
  patternist: { title: 'Patternist', author: 'Octavia E. Butler' },
  maddaddam: { title: 'MaddAddam', author: 'Margaret Atwood' },
  'commonwealth-saga': { title: 'Commonwealth Saga', author: 'Peter F. Hamilton' },
  dune: { title: 'Dune', author: 'Frank Herbert' },
  'remembrance-of-earths-past': { title: 'Remembrance of Earth’s Past', author: 'Cixin Liu' },
  'foundation-trilogy': { title: 'Foundation trilogy', author: 'Isaac Asimov' },
  culture: { title: 'The Culture', author: 'Iain M. Banks' }
};

export const kindleScienceFictionBooks = [
  book(
    'starfish', 'Starfish', 'Peter Watts', '1999', 'rifters', 'OL8514693W',
    'Civilization rests on the backs of its outcasts.',
    ['deep ocean', 'biotechnology', 'power']
  ),
  book(
    'maelstrom', 'Maelstrom', 'Peter Watts', '2001', 'rifters', null,
    'Second in the Rifters Trilogy, Hugo Award-winning author Peter Watts’ Maelstrom is a terrifying explosion of cyberpunk noir.',
    ['networks', 'catastrophe', 'emergence'],
    'https://us.macmillan.com/books/9781429982214/maelstrom/', 'Macmillan / Tor Books'
  ),
  book(
    'behemoth', 'Behemoth', 'Peter Watts', '2004', 'rifters', null,
    'This is the way it was meant to be.',
    ['biotechnology', 'catastrophe', 'containment'],
    'https://rifters.com/real/shorts/PeterWatts_Behemoth.pdf', 'Peter Watts — author text'
  ),
  book(
    'a-desolation-called-peace', 'A Desolation Called Peace', 'Arkady Martine', '2021', 'teixcalaan', 'OL20832939W',
    'Sequel to A Memory Called Empire.',
    ['diplomacy', 'empire', 'first contact']
  ),
  book(
    'interference', 'Interference', 'Sue Burke', '2019', 'semiosis-trilogy', null,
    'The colonists and a team from Earth confront a new and more implacable intelligence.',
    ['nonhuman intelligence', 'ecology', 'cooperation'],
    'https://us.macmillan.com/books/9781250317810', 'Macmillan / Tor Books'
  ),
  book(
    'usurpation', 'Usurpation', 'Sue Burke', '2024', 'semiosis-trilogy', null,
    'Stevland, the dominant sentient lifeform of Pax, has clandestinely sent some of its progeny to Earth.',
    ['nonhuman intelligence', 'ecology', 'power'],
    'https://us.macmillan.com/books/9781250809186/usurpation/', 'Macmillan / Tor Books'
  ),
  book(
    'seven-surrenders', 'Seven Surrenders', 'Ada Palmer', '2017', 'terra-ignota', 'OL19213555W',
    'It is a world in which near-instantaneous travel from continent to continent is free to all.',
    ['abundance', 'political order', 'pluralism']
  ),
  book(
    'the-will-to-battle', 'The Will to Battle', 'Ada Palmer', '2017', 'terra-ignota', null,
    'Now comes Mycroft’s chronicle of the guideless search for an order to the conflict as the world slouches toward war.',
    ['political order', 'war', 'legitimacy'],
    'https://www.adapalmer.com/publication/the-will-to-battle/', 'Ada Palmer — author synopsis'
  ),
  book(
    'perhaps-the-stars', 'Perhaps the Stars', 'Ada Palmer', '2021', 'terra-ignota', null,
    'War has come to the world for the first time in centuries.',
    ['war', 'political order', 'social change'],
    'https://www.adapalmer.com/publication/perhaps-the-stars/', 'Ada Palmer — author synopsis'
  ),
  book(
    'rocanons-world', 'Rocannon’s World', 'Ursula K. Le Guin', '1966', 'le-guin', 'OL59850W',
    'Marooned among alien peoples, he leads the battle to free this newly discovered world and finds that legends grow around him as he fights.',
    ['first contact', 'anthropology', 'power']
  ),
  book(
    'planet-of-exile', 'Planet of Exile', 'Ursula K. Le Guin', '1966', 'le-guin', 'OL59836W',
    'The Earth colony of Landin has been stranded on Werel for ten years—& ten of Werel’s years are over 600 terrestrial years.',
    ['exile', 'cooperation', 'social change']
  ),
  book(
    'city-of-illusions', 'City of Illusions', 'Ursula K. Le Guin', '1967', 'le-guin', 'OL36745884W',
    'His eyes were not the eyes of a human.',
    ['identity', 'deception', 'political order']
  ),
  book(
    'the-left-hand-of-darkness', 'The Left Hand of Darkness', 'Ursula K. Le Guin', '1969', 'le-guin', 'OL59800W',
    'Try it and see – you will never think about people in quite the same way again.',
    ['gender', 'diplomacy', 'anthropology']
  ),
  book(
    'four-ways-to-forgiveness', 'Four Ways to Forgiveness', 'Ursula K. Le Guin', '1995', 'le-guin', 'OL59826W',
    'Here is a society as complex and troubled as any on our world, peopled with unforgettable characters struggling to become fully human.',
    ['slavery', 'revolution', 'forgiveness']
  ),
  book(
    'the-telling', 'The Telling', 'Ursula K. Le Guin', '2000', 'le-guin', 'OL59834W',
    'Once a culturally rich world, the planet Aka has been utterly transformed by technology.',
    ['culture', 'state power', 'technology']
  ),
  book(
    'the-lathe-of-heaven', 'The Lathe of Heaven', 'Ursula K. Le Guin', '1971', 'le-guin', 'OL59858W',
    'During a time racked by war and environmental catastrophe, George Orr discovers his dreams alter reality.',
    ['power', 'utopia', 'choice'],
    'https://www.simonandschuster.com/books/The-Lathe-of-Heaven/Ursula-K-Le-Guin/9781668017401', 'Simon & Schuster'
  ),
  book(
    'the-wild-shore', 'The Wild Shore', 'Kim Stanley Robinson', '1984', 'kim-stanley-robinson', 'OL81666W',
    '2047: and for sixty years America has been quarantined after a devastating nuclear attack.',
    ['catastrophe', 'community', 'political order']
  ),
  book(
    'the-gold-coast', 'The Gold Coast', 'Kim Stanley Robinson', '1988', 'kim-stanley-robinson', 'OL81663W',
    '2027: Southern California is a developer’s dream gone mad, an endless sprawl of condos, freeways, and malls.',
    ['development', 'political economy', 'social change']
  ),
  book(
    'pacific-edge', 'Pacific Edge', 'Kim Stanley Robinson', '1990', 'kim-stanley-robinson', 'OL81670W',
    '2065: In a world that has rediscovered harmony with nature, the village of El Modena, California, is an ecotopia in the making.',
    ['ecotopia', 'community', 'political economy']
  ),
  book(
    'forty-signs-of-rain', 'Forty Signs of Rain', 'Kim Stanley Robinson', '2004', 'kim-stanley-robinson', 'OL81653W',
    'Hauntingly realistic, here is a novel of the near future that is inspired by scientific facts already making headlines.',
    ['climate governance', 'science', 'public administration']
  ),
  book(
    'fifty-degrees-below', 'Fifty Degrees Below', 'Kim Stanley Robinson', '2005', 'kim-stanley-robinson', 'OL15176712W',
    'Bestselling, award-winning, author Kim Stanley Robinson continues his groundbreaking trilogy of eco-thrillers--and propels us deeper into the awesome whirlwind of climatic change.',
    ['climate governance', 'science', 'crisis']
  ),
  book(
    'sixty-days-and-counting', 'Sixty Days and Counting', 'Kim Stanley Robinson', '2007', 'kim-stanley-robinson', 'OL81657W',
    'By the time Phil Chase is elected president, the world’s climate is far on its way to irreversible change.',
    ['climate governance', 'politics', 'institutional change']
  ),
  book(
    '2312', '2312', 'Kim Stanley Robinson', '2012', 'kim-stanley-robinson', 'OL16298967W',
    'Scientific and technological advances have opened gateways to an extraordinary future.',
    ['future society', 'planetary engineering', 'political economy']
  ),
  book(
    'aurora', 'Aurora', 'Kim Stanley Robinson', '2015', 'kim-stanley-robinson', 'OL17346803W',
    'Generations after leaving Earth, a starship draws near to the planet that may serve as a new home world for those on board.',
    ['generation ship', 'ecology', 'machine intelligence']
  ),
  book(
    'the-city-in-the-middle-of-the-night', 'The City in the Middle of the Night', 'Charlie Jane Anders', '2019', null, 'OL20749104W',
    'Would you give up everything to change the world?',
    ['climate', 'social order', 'nonhuman intelligence']
  ),
  book(
    'the-fifth-season', 'The Fifth Season', 'N. K. Jemisin', '2015', 'broken-earth', 'OL17363125W',
    'A season of endings has begun.',
    ['catastrophe', 'oppression', 'power']
  ),
  book(
    'the-obelisk-gate', 'The Obelisk Gate', 'N. K. Jemisin', '2016', 'broken-earth', 'OL17842279W',
    'THIS IS THE WAY THE WORLD ENDS ...',
    ['catastrophe', 'oppression', 'survival']
  ),
  book(
    'the-stone-sky', 'The Stone Sky', 'N. K. Jemisin', '2017', 'broken-earth', 'OL17881901W',
    'The Moon will soon return.',
    ['catastrophe', 'justice', 'social order']
  ),
  book(
    'dawn', 'Dawn', 'Octavia E. Butler', '1987', 'xenogenesis', null,
    'One woman is called upon to rebuild the future of humankind after a nuclear war.',
    ['alien contact', 'consent', 'survival'],
    'https://books.apple.com/us/book/dawn/id6446761349', 'Apple Books — publisher description'
  ),
  book(
    'adulthood-rites', 'Adulthood Rites', 'Octavia E. Butler', '1988', 'xenogenesis', 'OL35625W',
    'After the near-extinction of the human race, one young man with extraordinary gifts will reveal whether the human race can learn from its past.',
    ['alien contact', 'identity', 'coexistence'],
    'https://www.hachettebookgroup.com/titles/octavia-e-butler/adulthood-rites/9781538753729/', 'Hachette / Grand Central'
  ),
  book(
    'imago', 'Imago', 'Octavia E. Butler', '1989', 'xenogenesis', null,
    'After the near-extinction of humanity, a new kind of alien-human hybrid must come to terms with their identity.',
    ['alien contact', 'identity', 'hybridity'],
    'https://www.hachettebookgroup.com/titles/octavia-e-butler/imago/9781538753736/?lens=grand-central-publishing', 'Hachette / Grand Central'
  ),
  book(
    'wild-seed', 'Wild Seed', 'Octavia E. Butler', '1980', 'patternist', 'OL35627W',
    'Doro is an entity who changes bodies like clothes, killing his hosts by reflex--or design.',
    ['immortality', 'power', 'coercion']
  ),
  book(
    'mind-of-my-mind', 'Mind of My Mind', 'Octavia E. Butler', '1977', 'patternist', 'OL35626W',
    'Mind of My Mind is the second novel in Butler’s Patternist series and is the prequel to her earlier novel Patternmaster.',
    ['telepathy', 'power', 'community']
  ),
  book(
    'clays-ark', 'Clay’s Ark', 'Octavia E. Butler', '1984', 'patternist', 'OL35622W',
    'In a frightening near future, an alien disease is poised to become a devastating global epidemic, unless someone can stop it.',
    ['pandemic', 'alien contact', 'survival']
  ),
  book(
    'patternmaster', 'Patternmaster', 'Octavia E. Butler', '1976', 'patternist', null,
    'A tyrant’s heirs battle to control the minds of every human on Earth.',
    ['telepathy', 'hierarchy', 'power'],
    'https://books.google.com/books/about/Patternmaster.html?id=k1JaAAAAMAAJ', 'Google Books — publisher description'
  ),
  book(
    'oryx-and-crake', 'Oryx and Crake', 'Margaret Atwood', '2003', 'maddaddam', null,
    'The first volume in the internationally acclaimed MaddAddam trilogy is at once an unforgettable love story and a compelling vision of the future.',
    ['biotechnology', 'corporate power', 'catastrophe'],
    'https://www.penguinrandomhouse.com/books/6113/oryx-and-crake-by-margaret-atwood/', 'Penguin Random House'
  ),
  book(
    'the-year-of-the-flood', 'The Year of the Flood', 'Margaret Atwood', '2009', 'maddaddam', null,
    'The long-feared waterless flood has occurred, altering Earth as we know it and obliterating most human life.',
    ['biotechnology', 'survival', 'community'],
    'https://www.penguinrandomhouse.com/series/YAM/the-maddaddam-trilogy/', 'Penguin Random House'
  ),
  book(
    'maddaddam', 'MaddAddam', 'Margaret Atwood', '2013', 'maddaddam', null,
    'The Waterless Flood pandemic has wiped out most of the population.',
    ['biotechnology', 'survival', 'storytelling'],
    'https://www.penguinrandomhouse.com/books/6107/maddaddam-by-margaret-atwood/paperback/', 'Penguin Random House'
  ),
  book(
    'pandoras-star', 'Pandora’s Star', 'Peter F. Hamilton', '2004', 'commonwealth-saga', null,
    'Pandora’s Star is the first part of Peter F. Hamilton’s epic Commonwealth Saga duology.',
    ['interstellar politics', 'wormholes', 'first contact'],
    'https://www.panmacmillan.com/authors/peter-f-hamilton/pandoras-star/9781509868575', 'Pan Macmillan'
  ),
  book(
    'judas-unchained', 'Judas Unchained', 'Peter F. Hamilton', '2005', 'commonwealth-saga', 'OL474023W',
    'No mere world builder, Hamilton creates entire universes--and he does so with irresistible flair and intelligence.',
    ['interstellar politics', 'war', 'conspiracy']
  ),
  book(
    'the-stars-my-destination', 'The Stars My Destination', 'Alfred Bester', '1956', null, 'OL1819353W',
    'The Stars My Destination is a classic of technological prophecy and timeless narrative enchantment by an acknowledged master of science fiction.',
    ['revenge', 'telepathy', 'social change']
  ),
  book(
    'a-canticle-for-leibowitz', 'A Canticle for Leibowitz', 'Walter M. Miller Jr.', '1959', null, null,
    'In the depths of the Utah desert, long after the Flame Deluge has scoured the earth clean…',
    ['institutional memory', 'religion', 'catastrophe'],
    'https://www.penguinrandomhouse.com/books/114888/a-canticle-for-leibowitz-by-walter-m-miller-jr/', 'Penguin Random House'
  ),
  book(
    'leviathan-wakes', 'Leviathan Wakes', 'James S. A. Corey', '2011', null, 'OL16114008W',
    'When Captain Jim Holden\'s ice miner stumbles across a derelict, abandoned ship, he uncovers a secret that threatens to throw the entire system into war.',
    ['interplanetary politics', 'inequality', 'first contact']
  ),
  book(
    'solaris', 'Solaris', 'Stanisław Lem', '1961', null, null,
    'Solaris is the most famous of Lem’s novels.',
    ['alien intelligence', 'communication', 'epistemology'],
    'https://english.lem.pl/index.php/works/novels/solaris', 'Stanisław Lem — official site'
  ),
  book(
    'dune', 'Dune', 'Frank Herbert', '1965', 'dune', 'OL893414W',
    'Coveted across the known universe, melange is a prize worth killing for.',
    ['empire', 'ecology', 'prophecy']
  ),
  book(
    'dune-messiah', 'Dune Messiah', 'Frank Herbert', '1969', 'dune', 'OL893461W',
    'As Emperor of the known universe, he possesses more power than a single man was ever meant to wield.',
    ['empire', 'prophecy', 'power']
  ),
  book(
    'ringworld', 'Ringworld', 'Larry Niven', '1970', null, null,
    'Four travelers come to the ringworld.',
    ['megastructure', 'exploration', 'first contact'],
    'https://www.penguinrandomhouse.com/books/122174/ringworld-by-larry-niven/', 'Penguin Random House'
  ),
  book(
    'the-forever-war', 'The Forever War', 'Joe Haldeman', '1974', null, null,
    'The Earth\'s leaders have drawn a line in the interstellar sand--despite the fact that the fierce alien enemy they would oppose is inscrutable…',
    ['war', 'time dilation', 'institutions'],
    'https://us.macmillan.com/books/9780312536633/theforeverwar/', 'Macmillan / St. Martin’s Griffin'
  ),
  book(
    'rendezvous-with-rama', 'Rendezvous with Rama', 'Arthur C. Clarke', '1973', null, 'OL17417W',
    'Written in 1973, a massive 50 kilometre long alien cylinder begins to pass through the solar system provoking a hurried effort to intercept it.',
    ['first contact', 'exploration', 'alien artefact']
  ),
  book(
    'childhoods-end', 'Childhood’s End', 'Arthur C. Clarke', '1953', null, null,
    'Spaceships have suddenly appeared in the skies above every city on the planet.',
    ['first contact', 'authority', 'posthumanity'],
    'https://www.penguinrandomhouse.com/books/28158/childhoods-end-by-arthur-c-clarke/', 'Penguin Random House'
  ),
  book(
    'the-dark-forest', 'The Dark Forest', 'Cixin Liu, translated by Joel Martinsen', '2015', 'remembrance-of-earths-past', null,
    'The Dark Forest is the second novel in the groundbreaking, Hugo Award-winning series from China\'s most beloved science fiction author, Cixin Liu.',
    ['civilizational threat', 'strategy', 'opacity'],
    'https://us.macmillan.com/books/9780765386694/thedarkforest/', 'Macmillan / Tor Books'
  ),
  book(
    'deaths-end', 'Death’s End', 'Cixin Liu, translated by Ken Liu', '2016', 'remembrance-of-earths-past', null,
    'No banquet was eternal. Everything had an end. Everything.',
    ['civilizational threat', 'strategy', 'longtermism'],
    'https://us.macmillan.com/books/9780765377104/deathsend/', 'Macmillan / Tor Books'
  ),
  book(
    'foundation', 'Foundation', 'Isaac Asimov', '1951', 'foundation-trilogy', 'OL46125W',
    'The story of our future begins with the history of Foundation and its greatest psychohistorian: Hari Seldon.',
    ['prediction', 'empire', 'institution building']
  ),
  book(
    'foundation-and-empire', 'Foundation and Empire', 'Isaac Asimov', '1952', 'foundation-trilogy', 'OL46224W',
    'Yet now it must face the Empire still the mightiest force in the Galaxy even in its death throes.',
    ['prediction', 'empire', 'war']
  ),
  book(
    'second-foundation', 'Second Foundation', 'Isaac Asimov', '1953', 'foundation-trilogy', 'OL46309W',
    'After years of struggle, the Foundation lay in ruins -- destroyed by the mutant mind power of the Mule.',
    ['prediction', 'secrecy', 'power']
  ),
  book(
    'the-player-of-games', 'The Player of Games', 'Iain M. Banks', '1988', 'culture', 'OL100779W',
    'The Culture - a human/machine symbiotic society - has thrown up many great Game Players, and one of the greatest is Gurgeh.',
    ['machine civilisation', 'post-scarcity', 'games']
  ),
  book(
    'the-expert-systems-champion', 'The Expert System’s Champion', 'Adrian Tchaikovsky', '2021', null, null,
    'Sometimes the ones you hate are the only ones that can save you.',
    ['distributed expertise', 'ecology', 'social order'],
    'https://www.panmacmillan.com/authors/adrian-tchaikovsky/the-expert-systems-champion/9781035071425', 'Pan Macmillan'
  ),
  book(
    'the-city-and-the-city', 'The City & the City', 'China Miéville', '2009', null, 'OL19341943W',
    'Inspector Tyador Borlú must travel to Ul Qoma to search for answers in the murder of a woman found in the city of Besźel.',
    ['borders', 'jurisdiction', 'perception']
  )
];
