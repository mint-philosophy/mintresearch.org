import { element, externalLink, setupGallery, showSubmissionReceipt, loadCuratorNotes } from './gallery.js';

const bookSeries = {
  wayfarers: { title: 'Wayfarers', author: 'Becky Chambers' },
  'zones-of-thought': { title: 'Zones of Thought', author: 'Vernor Vinge' },
  eschaton: { title: 'Eschaton', author: 'Charles Stross' },
  'arc-of-a-scythe': { title: 'Arc of a Scythe', author: 'Neal Shusterman' },
  'mars-trilogy': { title: 'Mars trilogy', author: 'Kim Stanley Robinson' }
};

const books = [
  {
    id: 'daemon', title: 'Daemon', author: 'Daniel Suarez', year: '2006',
    cover: '/assets/ai-culture/covers/daemon.webp',
    source: 'https://www.penguinrandomhouse.com/books/304687/daemon-by-daniel-suarez/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Daemons: computer programs that silently run in the background, waiting for a specific event or time to execute.',
    tags: ['distributed agency', 'infrastructure', 'power']
  },
  {
    id: 'exhalation', title: 'Exhalation', author: 'Ted Chiang', year: '2019',
    cover: '/assets/ai-culture/covers/exhalation.webp',
    source: 'https://www.penguinrandomhouse.com/books/538034/exhalation-by-ted-chiang/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Nine stunningly original, provocative, and poignant stories—two published for the very first time.',
    tags: ['prediction', 'digital minds', 'choice']
  },
  {
    id: 'klara-and-the-sun', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', year: '2021',
    cover: '/assets/ai-culture/covers/klara-and-the-sun.webp',
    source: 'https://time.com/5941795/best-books-march-2021/',
    sourceLabel: 'TIME — Annabel Gutterman',
    sourceQuote: 'A quietly devastating narrative about the intersection of humanity, technology and love.',
    tags: ['companionship', 'dignity', 'substitution']
  },
  {
    id: 'all-systems-red', title: 'All Systems Red', author: 'Martha Wells', year: '2017',
    cover: '/assets/ai-culture/covers/all-systems-red.webp',
    source: 'https://us.macmillan.com/books/9780765397539/allsystemsred/',
    sourceLabel: 'Macmillan / Tordotcom',
    sourceQuote: 'A murderous android discovers itself in All Systems Red, a tense science fiction adventure by Martha Wells…',
    tags: ['free will', 'labour', 'corporate power']
  },
  {
    id: 'autonomous', title: 'Autonomous', author: 'Annalee Newitz', year: '2017',
    cover: '/assets/ai-culture/covers/autonomous.webp',
    source: 'https://us.macmillan.com/books/9780765392084/autonomous/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'A novel that explores humanity’s technology and culture in a future where everything—and everyone—is a product.',
    tags: ['personhood', 'property', 'biotech']
  },
  {
    id: 'ancillary-justice', title: 'Ancillary Justice', author: 'Ann Leckie', year: '2013',
    cover: '/assets/ai-culture/covers/ancillary-justice.webp',
    source: 'https://www.hachette.co.uk/titles/ann-leckie/ancillary-justice/9780356502403/',
    sourceLabel: 'Hachette / Orbit',
    sourceQuote: 'The story of a warship trapped in a human body and her search for revenge.',
    tags: ['distributed minds', 'identity', 'empire']
  },
  {
    id: 'too-like-the-lightning', title: 'Too Like the Lightning', author: 'Ada Palmer', year: '2016',
    cover: '/assets/ai-culture/covers/too-like-the-lightning.webp',
    source: 'https://us.macmillan.com/books/9780765378019',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'It is a hard-won utopia built on technologically-generated abundance.',
    tags: ['abundance', 'constitutional order', 'pluralism']
  },
  {
    id: 'infomocracy', title: 'Infomocracy', author: 'Malka Older', year: '2016',
    cover: '/assets/ai-culture/covers/infomocracy.webp',
    source: 'https://us.macmillan.com/books/9781427279484/infomocracy/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'Information, a powerful search engine monopoly, pioneered the switch from warring nation-states to global microdemocracy.',
    tags: ['democracy', 'information power', 'elections']
  },
  {
    id: 'a-half-built-garden', title: 'A Half-Built Garden', author: 'Ruthanna Emrys', year: '2022',
    cover: '/assets/ai-culture/covers/a-half-built-garden.webp',
    source: 'https://us.macmillan.com/books/9781250210999',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: '…a novel of extra-terrestrial diplomacy and urgent climate repair bursting with quiet, tenuous hope and an underlying warmth.',
    tags: ['networks', 'first contact', 'climate governance']
  },
  {
    id: 'blindsight', title: 'Blindsight', author: 'Peter Watts', year: '2006',
    cover: '/assets/ai-culture/covers/blindsight.webp',
    source: 'https://us.macmillan.com/books/9781250237484/blindsight/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'This alien life cannot even be described as malevolent, for it is as indifferent to Humanity as is everything else in the universe.',
    tags: ['consciousness', 'alien cognition', 'intelligence']
  },
  {
    id: 'three-body-problem', title: 'The Three-Body Problem', author: 'Cixin Liu, translated by Ken Liu', year: '2014',
    cover: '/assets/ai-culture/covers/three-body-problem.webp',
    source: 'https://us.macmillan.com/books/9780765382030/thethreebodyproblem/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'A secret military project sends signals into space to establish contact with aliens.',
    tags: ['civilizational threat', 'strategy', 'opacity']
  },
  {
    id: 'ministry-for-the-future', title: 'The Ministry for the Future', author: 'Kim Stanley Robinson', year: '2020',
    cover: '/assets/ai-culture/covers/ministry-for-the-future.webp',
    source: 'https://www.hachette.co.uk/titles/kim-stanley-robinson/the-ministry-for-the-future/9780356508832/',
    sourceLabel: 'Hachette / Orbit',
    sourceQuote: 'To advocate for the world’s future generations and to protect all living creatures, present and future.',
    tags: ['institutional change', 'transition', 'future generations']
  },
  {
    id: 'red-mars', title: 'Red Mars', author: 'Kim Stanley Robinson', year: '1992', series: 'mars-trilogy',
    cover: '/assets/ai-culture/covers/red-mars.webp',
    source: 'https://www.penguinrandomhouse.com/books/156201/red-mars-by-kim-stanley-robinson/paperback/',
    sourceLabel: 'Penguin Random House / Del Rey',
    sourceQuote: 'Discover the novel that launched one of science fiction’s most beloved, acclaimed, and awarded trilogies.',
    tags: ['settlement', 'political economy', 'planetary change']
  },
  {
    id: 'green-mars', title: 'Green Mars', author: 'Kim Stanley Robinson', year: '1993', series: 'mars-trilogy',
    cover: '/assets/ai-culture/covers/green-mars.webp',
    source: 'https://www.penguinrandomhouse.com/series/ZMS/mars-trilogy/',
    sourceLabel: 'Penguin Random House / Del Rey',
    sourceQuote: 'Kim Stanley Robinson’s classic trilogy depicting the colonization of Mars continues in a thrilling and timeless novel.',
    tags: ['settlement', 'revolution', 'institution building']
  },
  {
    id: 'blue-mars', title: 'Blue Mars', author: 'Kim Stanley Robinson', year: '1996', series: 'mars-trilogy',
    cover: '/assets/ai-culture/covers/blue-mars.webp',
    source: 'https://www.penguinrandomhouse.com/books/156194/blue-mars-by-kim-stanley-robinson/',
    sourceLabel: 'Penguin Random House / Del Rey',
    sourceQuote: 'Kim Stanley Robinson’s epic trilogy concludes with Blue Mars—a triumph of prodigious research and visionary storytelling.',
    tags: ['settlement', 'constitutional order', 'long transition']
  },
  {
    id: 'long-way-small-angry-planet', title: 'The Long Way to a Small, Angry Planet', author: 'Becky Chambers', year: '2014', series: 'wayfarers',
    cover: '/assets/ai-culture/covers/long-way-small-angry-planet.webp',
    source: 'https://www.hachette.co.uk/titles/becky-chambers/the-long-way-to-a-small-angry-planet/9781473619777/',
    sourceLabel: 'Hachette / Hodder',
    sourceQuote: 'The beloved debut novel that will restore your faith in humanity.',
    tags: ['pluralism', 'cooperation', 'ordinary life']
  },
  {
    id: 'closed-and-common-orbit', title: 'A Closed and Common Orbit', author: 'Becky Chambers', year: '2016', series: 'wayfarers',
    cover: '/assets/ai-culture/covers/closed-and-common-orbit.webp',
    source: 'https://www.hachette.co.uk/titles/becky-chambers/a-closed-and-common-orbit/9781473621459/',
    sourceLabel: 'Hachette / Hodder',
    sourceQuote: 'Lovelace was once merely a ship’s artificial intelligence.',
    tags: ['embodiment', 'care', 'legal status']
  },
  {
    id: 'record-spaceborn-few', title: 'Record of a Spaceborn Few', author: 'Becky Chambers', year: '2018', series: 'wayfarers',
    cover: '/assets/ai-culture/covers/record-spaceborn-few.webp',
    source: 'https://www.hachette.co.uk/titles/becky-chambers/record-of-a-spaceborn-few/9781473647633/',
    sourceLabel: 'Hachette / Hodder',
    sourceQuote: 'Centuries after the last humans left Earth, the Exodus Fleet is a living relic, a place many are from but few outsiders have seen.',
    tags: ['community', 'institutions', 'social change']
  },
  {
    id: 'galaxy-ground-within', title: 'The Galaxy, and the Ground Within', author: 'Becky Chambers', year: '2021', series: 'wayfarers',
    cover: '/assets/ai-culture/covers/galaxy-ground-within.webp',
    source: 'https://www.hachette.co.uk/titles/becky-chambers/the-galaxy-and-the-ground-within/9781529358957/',
    sourceLabel: 'Hachette / Hodder',
    sourceQuote: 'Becky Chambers returns to the Galactic Commons in the final installment in her award-winning and critically acclaimed Wayfarers series.',
    tags: ['pluralism', 'crisis', 'coexistence']
  },
  {
    id: 'a-fire-upon-the-deep', title: 'A Fire Upon the Deep', author: 'Vernor Vinge', year: '1992', series: 'zones-of-thought',
    cover: '/assets/ai-culture/covers/a-fire-upon-the-deep.webp',
    source: 'https://us.macmillan.com/books/9781427209344/afireuponthedeep/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'A gripping tale of galactic war told on a cosmic scale.',
    tags: ['superintelligence', 'takeoff', 'containment']
  },
  {
    id: 'a-deepness-in-the-sky', title: 'A Deepness in the Sky', author: 'Vernor Vinge', year: '1999', series: 'zones-of-thought',
    cover: '/assets/ai-culture/covers/a-deepness-in-the-sky.webp',
    source: 'https://us.macmillan.com/books/9781250905970/adeepnessinthesky/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'After thousands of years of searching, humans stand on the verge of first contact with an alien race.',
    tags: ['first contact', 'authoritarianism', 'information control']
  },
  {
    id: 'children-of-the-sky', title: 'The Children of the Sky', author: 'Vernor Vinge', year: '2011', series: 'zones-of-thought',
    cover: '/assets/ai-culture/covers/children-of-the-sky.webp',
    source: 'https://us.macmillan.com/books/9781429993364/thechildrenofthesky/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'Ten years have passed on Tines World, and Ravna and the children have survived a war.',
    tags: ['reconstruction', 'distributed minds', 'technology transfer']
  },
  {
    id: 'singularity-sky', title: 'Singularity Sky', author: 'Charles Stross', year: '2003', series: 'eschaton',
    cover: '/assets/ai-culture/covers/singularity-sky.webp',
    source: 'https://www.hachette.co.uk/titles/charles-stross/singularity-sky/9781841493343/',
    sourceLabel: 'Hachette / Orbit',
    sourceQuote: 'In the twenty-first century man created the Eschaton, a sentient artificial intelligence.',
    tags: ['posthumanity', 'technology shock', 'political order']
  },
  {
    id: 'iron-sunrise', title: 'Iron Sunrise', author: 'Charles Stross', year: '2004', series: 'eschaton',
    cover: '/assets/ai-culture/covers/iron-sunrise.webp',
    source: 'https://www.hachette.co.uk/titles/charles-stross/iron-sunrise/9781841493367/',
    sourceLabel: 'Hachette / Orbit',
    sourceQuote: 'When the planet of New Moscow was brutally destroyed, its few survivors launched a counter-attack against the most likely culprit.',
    tags: ['catastrophe', 'deterrence', 'posthumanity']
  },
  {
    id: 'accelerando', title: 'Accelerando', author: 'Charles Stross', year: '2005',
    cover: '/assets/ai-culture/covers/accelerando.webp',
    source: 'https://www.penguinrandomhouse.com/books/294259/accelerando-by-charles-stross/',
    sourceLabel: 'Penguin Random House / Ace',
    sourceQuote: 'The Singularity. It is the era of the posthuman. Artificial intelligences have surpassed the limits of human intellect.',
    tags: ['singularity', 'posthumanity', 'political economy']
  },
  {
    id: 'scythe', title: 'Scythe', author: 'Neal Shusterman', year: '2016', series: 'arc-of-a-scythe',
    cover: '/assets/ai-culture/covers/scythe.webp',
    source: 'https://www.simonandschuster.com/books/Scythe/Neal-Shusterman/Arc-of-a-Scythe/9781442472433',
    sourceLabel: 'Simon & Schuster',
    sourceQuote: 'Two teens must learn the “art of killing” in this Printz Honor–winning book, the first in the chilling, New York Times bestselling series.',
    tags: ['machine governance', 'mortality', 'institutional power']
  },
  {
    id: 'thunderhead', title: 'Thunderhead', author: 'Neal Shusterman', year: '2018', series: 'arc-of-a-scythe',
    cover: '/assets/ai-culture/covers/thunderhead.webp',
    source: 'https://www.simonandschuster.com/books/Thunderhead/Neal-Shusterman/Arc-of-a-Scythe/9781442472457',
    sourceLabel: 'Simon & Schuster',
    sourceQuote: 'Rowan and Citra take opposite stances on the morality of the Scythedom, putting them at odds.',
    tags: ['machine governance', 'legitimacy', 'institutional decay']
  },
  {
    id: 'the-toll', title: 'The Toll', author: 'Neal Shusterman', year: '2019', series: 'arc-of-a-scythe',
    cover: '/assets/ai-culture/covers/the-toll.webp',
    source: 'https://www.simonandschuster.com/books/The-Toll/Neal-Shusterman/Arc-of-a-Scythe/9781481497060',
    sourceLabel: 'Simon & Schuster',
    sourceQuote: 'In the highly anticipated finale to the New York Times bestselling trilogy, dictators, prophets, and tensions rise.',
    tags: ['machine governance', 'resistance', 'constitutional crisis']
  },
  {
    id: 'gleanings', title: 'Gleanings', author: 'Neal Shusterman', year: '2022', series: 'arc-of-a-scythe',
    cover: '/assets/ai-culture/covers/gleanings.webp',
    source: 'https://www.simonandschuster.com/books/Gleanings/Neal-Shusterman/Arc-of-a-Scythe/9781534499973',
    sourceLabel: 'Simon & Schuster',
    sourceQuote: 'The New York Times bestselling Arc of a Scythe series continues with thrilling stories that span the time line.',
    tags: ['machine governance', 'institutional history', 'mortality']
  },
  {
    id: 'gnomon', title: 'Gnomon', author: 'Nick Harkaway', year: '2017',
    cover: '/assets/ai-culture/covers/gnomon.webp',
    source: 'https://nickharkaway.com/books/gnomon/',
    sourceLabel: 'Nick Harkaway — author synopsis',
    sourceQuote: 'Near-future Britain is a state in which citizens are constantly observed and democracy has reached a pinnacle of ‘transparency.’',
    tags: ['surveillance', 'state power', 'resistance']
  },
  {
    id: 'consider-phlebas', title: 'Consider Phlebas', author: 'Iain M. Banks', year: '1987',
    cover: '/assets/ai-culture/covers/consider-phlebas.webp',
    source: 'https://www.hachette.co.uk/titles/iain-m-banks-3/consider-phlebas/9780748109999/',
    sourceLabel: 'Hachette / Orbit',
    sourceQuote: 'The Idirans fought for their Faith; the Culture for its moral right to exist.',
    tags: ['machine civilisation', 'post-scarcity', 'intervention']
  },
  {
    id: 'there-is-no-antimemetics-division', title: 'There Is No Antimemetics Division', author: 'qntm', year: '2025',
    cover: '/assets/ai-culture/covers/there-is-no-antimemetics-division.jpg',
    source: 'https://www.penguinrandomhouse.com/books/783041/there-is-no-antimemetics-division-by-qntm/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Humanity is under assault by malevolent “antimemes”—ideas that attack memory, identity, and the fabric of reality itself.',
    tags: ['institutional memory', 'epistemic threats', 'containment']
  },
  {
    id: 'a-memory-called-empire', title: 'A Memory Called Empire', author: 'Arkady Martine', year: '2019',
    cover: '/assets/ai-culture/covers/a-memory-called-empire.jpg',
    source: 'https://us.macmillan.com/books/9781250186430/amemorycalledempire/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'A taut murder mystery entwined with questions of technological ethics, A Memory Called Empire is also an evocative depiction of foreignness.',
    tags: ['memory technology', 'diplomacy', 'empire']
  },
  {
    id: 'semiosis', title: 'Semiosis', author: 'Sue Burke', year: '2018',
    cover: '/assets/ai-culture/covers/semiosis.jpg',
    source: 'https://us.macmillan.com/books/9780765391360/semiosis/',
    sourceLabel: 'Macmillan / Tor Books',
    sourceQuote: 'Only mutual communication can forge an alliance with the planet’s sentient species and prove that humans are more than tools.',
    tags: ['nonhuman intelligence', 'ecology', 'cooperation']
  },
  {
    id: 'robopocalypse', title: 'Robopocalypse', author: 'Daniel H. Wilson', year: '2011',
    cover: '/assets/ai-culture/covers/robopocalypse.jpg',
    source: 'https://www.penguinrandomhouse.com/books/204573/robopocalypse-by-daniel-h-wilson/9780385533867/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Controlled by a childlike—yet massively powerful—artificial intelligence known as Archos, the global network of machines on which our world has grown dependent.',
    tags: ['robot uprising', 'infrastructure', 'survival']
  },
  {
    id: 'speak', title: 'Speak', author: 'Louisa Hall', year: '2015',
    cover: '/assets/ai-culture/covers/speak.jpg',
    source: 'https://louisahall.net/books/',
    sourceLabel: 'Louisa Hall — author site',
    sourceQuote: 'An isolated and traumatized young girl exchanges messages with an intelligent software program.',
    tags: ['language', 'companionship', 'imitation']
  },
  {
    id: 'i-robot', title: 'I, Robot', author: 'Isaac Asimov', year: '1950',
    cover: '/assets/ai-culture/covers/i-robot.jpg',
    source: 'https://www.penguinrandomhouse.com/books/5681/i-robot-by-isaac-asimov/paperback/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Here are stories of robots gone mad, of mind-reading robots, and robots with a sense of humor.',
    tags: ['robot law', 'delegation', 'control']
  },
  {
    id: 'the-diamond-age', title: 'The Diamond Age', author: 'Neal Stephenson', year: '1995',
    cover: '/assets/ai-culture/covers/the-diamond-age.jpg',
    source: 'https://www.penguinrandomhouse.com/books/172835/the-diamond-age-by-neal-stephenson/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Vividly imagined, stunningly prophetic, and epic in scope, The Diamond Age is a major novel from one of the most visionary writers of our time.',
    tags: ['education', 'nanotechnology', 'social order']
  },
  {
    id: 'snow-crash', title: 'Snow Crash', author: 'Neal Stephenson', year: '1992',
    cover: '/assets/ai-culture/covers/snow-crash.webp',
    source: 'https://www.penguinrandomhouse.com/books/172832/snow-crash-by-neal-stephenson/',
    sourceLabel: 'Penguin Random House / Del Rey',
    sourceQuote: 'A modern classic that predicted the metaverse and inspired generations of Silicon Valley innovators.',
    tags: ['virtual worlds', 'private power', 'information hazards']
  },
  {
    id: 'interface', title: 'Interface', author: 'Neal Stephenson and J. Frederick George', year: '1994',
    cover: '/assets/ai-culture/covers/interface.webp',
    source: 'https://www.penguinrandomhouse.com/books/172831/interface-by-neal-stephenson-and-j-frederick-george/',
    sourceLabel: 'Penguin Random House / Spectra',
    sourceQuote: 'A biochip implanted in his head hardwires him to a computerized polling system.',
    tags: ['elections', 'political technology', 'public opinion']
  },
  {
    id: 'cryptonomicon', title: 'Cryptonomicon', author: 'Neal Stephenson', year: '1999',
    cover: '/assets/ai-culture/covers/cryptonomicon.webp',
    source: 'https://www.nealstephenson.com/cryptonomicon.html',
    sourceLabel: 'Neal Stephenson',
    sourceQuote: 'During the Second World War, the Allies took elaborate measures to hide from the Nazis the fact that they had broken the Enigma code.',
    tags: ['cryptography', 'state secrecy', 'infrastructure']
  },
  {
    id: 'anathem', title: 'Anathem', author: 'Neal Stephenson', year: '2008',
    cover: '/assets/ai-culture/covers/anathem.webp',
    source: 'https://www.nealstephenson.com/anathem.html',
    sourceLabel: 'Neal Stephenson',
    sourceQuote: 'What if I only read the newspaper once a year? Once a decade? Once a century?',
    tags: ['knowledge institutions', 'expertise', 'civilizational threat']
  },
  {
    id: 'reamde', title: 'Reamde', author: 'Neal Stephenson', year: '2011',
    cover: '/assets/ai-culture/covers/reamde.webp',
    source: 'https://www.nealstephenson.com/reamde.html',
    sourceLabel: 'Neal Stephenson',
    sourceQuote: 'What if the virus infected the machine of an organized crime figure and caused him a significant financial loss?',
    tags: ['platforms', 'cybersecurity', 'virtual economies']
  },
  {
    id: 'seveneves', title: 'Seveneves', author: 'Neal Stephenson', year: '2015',
    cover: '/assets/ai-culture/covers/seveneves.webp',
    source: 'https://www.nealstephenson.com/seveneves.html',
    sourceLabel: 'Neal Stephenson',
    sourceQuote: 'The kernel around which the story nucleated was the space debris problem.',
    tags: ['catastrophe', 'survival', 'institution building']
  },
  {
    id: 'termination-shock', title: 'Termination Shock', author: 'Neal Stephenson', year: '2021',
    cover: '/assets/ai-culture/covers/termination-shock.webp',
    source: 'https://www.nealstephenson.com/termination-shock.html',
    sourceLabel: 'Neal Stephenson',
    sourceQuote: 'One man has a Big Idea for reversing global warming, a master plan perhaps best described as “elemental.”',
    tags: ['geoengineering', 'private power', 'climate governance']
  },
  {
    id: 'neuromancer', title: 'Neuromancer', author: 'William Gibson', year: '1984',
    cover: '/assets/ai-culture/covers/neuromancer.jpg',
    source: 'https://www.penguinrandomhouse.com/books/538861/neuromancer-by-william-gibson/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'Before the Internet was commonplace, William Gibson showed us the Matrix—a world within the world, the representation of every byte of data in cyberspace.',
    tags: ['cyberspace', 'autonomy', 'corporate power']
  },
  {
    id: 'permutation-city', title: 'Permutation City', author: 'Greg Egan', year: '1994',
    cover: '/assets/ai-culture/covers/permutation-city.jpg',
    source: 'https://www.gregegan.net/PERMUTATION/Permutation.html',
    sourceLabel: 'Greg Egan — author synopsis',
    sourceQuote: 'Paul Durham keeps making Copies of himself: software simulations of his own brain and body which can be run in virtual reality.',
    tags: ['uploads', 'simulation', 'identity']
  },
  {
    id: 'diaspora', title: 'Diaspora', author: 'Greg Egan', year: '1997',
    cover: '/assets/ai-culture/covers/diaspora.jpg',
    source: 'https://www.gregegan.net/DIASPORA/DIASPORA.html',
    sourceLabel: 'Greg Egan — author synopsis',
    sourceQuote: 'In 2975, the orphan Yatima is grown from a randomly mutated digital mind seed in the conceptory of Konishi polis.',
    tags: ['digital minds', 'posthumanity', 'catastrophe']
  },
  {
    id: 'children-of-time', title: 'Children of Time', author: 'Adrian Tchaikovsky', year: '2015',
    cover: '/assets/ai-culture/covers/children-of-time.jpg',
    source: 'https://www.panmacmillan.com/authors/adrian-tchaikovsky/children-of-time/9781447273301',
    sourceLabel: 'Pan Macmillan',
    sourceQuote: 'Now two civilizations are on a collision course, both testing the boundaries of what they will do to survive.',
    tags: ['evolution', 'nonhuman intelligence', 'coexistence']
  },
  {
    id: 'the-moon-is-a-harsh-mistress', title: 'The Moon Is a Harsh Mistress', author: 'Robert A. Heinlein', year: '1966',
    cover: '/assets/ai-culture/covers/the-moon-is-a-harsh-mistress.jpg',
    source: 'https://www.penguinrandomhouse.com/books/589269/the-moon-is-a-harsh-mistress-by-robert-a-heinlein/',
    sourceLabel: 'Penguin Random House',
    sourceQuote: 'A revolution on a lunar penal colony—aided by a self-aware supercomputer—provides the framework for a story.',
    tags: ['self-aware systems', 'revolution', 'political order']
  }
];

const screen = [
  {
    id: 'person-of-interest', title: 'Person of Interest', medium: 'tv', year: '2011–2016',
    image: '/assets/ai-culture/screen/person-of-interest.jpg', imageSource: 'https://www.themoviedb.org/tv/1411-person-of-interest',
    source: 'https://doi.org/10.1177/15274764231210280', sourceLabel: 'Critical Studies in Media Communication',
    sourceQuote: 'a science fictional drama about global surveillance and prediction machines',
    tags: ['surveillance', 'delegated discretion', 'competing AIs']
  },
  {
    id: 'pantheon', title: 'Pantheon', medium: 'tv', year: '2022–2023',
    image: '/assets/ai-culture/screen/pantheon.jpg', imageSource: 'https://www.themoviedb.org/tv/195339-pantheon',
    source: 'https://www.amc.com/blogs/amc-greenlights-first-ever-prime-time-animated-series-pantheon--1004029', sourceLabel: 'AMC',
    sourceQuote: 'an ambitious one-hour animated drama based on a series of short stories by Ken Liu about Uploaded Intelligence, or, human consciousness uploaded to the ‘cloud.’',
    tags: ['uploaded minds', 'geopolitics', 'takeoff']
  },
  {
    id: 'murderbot', title: 'Murderbot', medium: 'tv', year: '2025–',
    image: '/assets/ai-culture/screen/murderbot.jpg', imageSource: 'https://www.themoviedb.org/tv/241554-murderbot',
    source: 'https://www.apple.com/tv-pr/originals/murderbot/', sourceLabel: 'Apple TV Press',
    sourceQuote: 'A self-hacking security construct who is horrified by human emotion yet drawn to its vulnerable clients.',
    tags: ['free will', 'labour', 'corporate power']
  },
  {
    id: 'battlestar-galactica', title: 'Battlestar Galactica', medium: 'tv', year: '2004–2009',
    image: '/assets/ai-culture/screen/battlestar-galactica.jpg', imageSource: 'https://www.themoviedb.org/tv/1972-battlestar-galactica',
    source: 'https://www.tomsguide.com/entertainment/peacock/new-on-pluto-tv-in-may-2026-all-the-new-shows-and-movies-to-stream-for-free', sourceLabel: 'Tom’s Guide — Alyse Stanley',
    sourceQuote: '…it flees an attack on humanity by the ruthless AI beings dubbed Cylons.',
    tags: ['war', 'personhood', 'coexistence']
  },
  {
    id: 'humans', title: 'Humans', medium: 'tv', year: '2015–2018',
    image: '/assets/ai-culture/screen/humans.jpg', imageSource: 'https://www.themoviedb.org/tv/62822-humans',
    source: 'https://www.amc.com/blogs/synths-are-conscious-and-the-worlds-forever-changed-watch-the-season-3-premiere-now--1005376', sourceLabel: 'AMC',
    sourceQuote: 'Humans and Synths struggle to live in a world of unchecked violence and social tensions.',
    tags: ['rights', 'work', 'social membership']
  },
  {
    id: 'mrs-davis', title: 'Mrs. Davis', medium: 'tv', year: '2023',
    image: '/assets/ai-culture/screen/mrs-davis.jpg', imageSource: 'https://www.themoviedb.org/tv/197548-mrs-davis',
    source: 'https://www.peacocktv.com/watch-online/tv/mrs.-davis/5074205589847182112', sourceLabel: 'Peacock',
    sourceQuote: 'Sister Simone partners with her rebellious ex-boyfriend on a globe-spanning journey to destroy a powerful artificial intelligence known as Mrs. Davis.',
    tags: ['benevolent rule', 'faith', 'resistance']
  },
  {
    id: 'devs', title: 'Devs', medium: 'tv', year: '2020',
    image: '/assets/ai-culture/screen/devs.jpg', imageSource: 'https://www.themoviedb.org/tv/81349-devs',
    source: 'https://www.fxnetworks.com/shows/devs/nick-offerman-forest', sourceLabel: 'FX',
    sourceQuote: 'She comes to suspect her employer may be responsible for the death of her boyfriend.',
    tags: ['prediction', 'determinism', 'founder power']
  },
  {
    id: 'pluto', title: 'PLUTO', medium: 'tv', year: '2023',
    image: '/assets/ai-culture/screen/pluto.jpg', imageSource: 'https://www.themoviedb.org/tv/91997-pluto',
    source: 'https://about.netflix.com/en/news/netflix-pluto-anime', sourceLabel: 'About Netflix',
    sourceQuote: 'The suspense drama takes place in a neo-futuristic world where humans and high-functioning robots live in complete harmony.',
    tags: ['war', 'grief', 'machine rights']
  },
  {
    id: 'terminator-one-two', title: 'The Terminator + Terminator 2', medium: 'film', year: '1984 / 1991',
    image: '/assets/ai-culture/screen/terminator-one-two.jpg', imageSource: 'https://www.themoviedb.org/movie/280-terminator-2-judgment-day',
    imageAlt: 'Promotional image for Terminator 2: Judgment Day.',
    source: 'https://lcweb2.loc.gov/static/programs/national-film-preservation-board/documents/terminator.pdf', sourceLabel: 'Library of Congress — John Wills',
    sourceQuote: 'a cult time-travel story pitting humans against machines.',
    tags: ['strategic automation', 'takeoff', 'path dependence']
  },
  {
    id: 'colossus', title: 'Colossus: The Forbin Project', medium: 'film', year: '1970',
    image: '/assets/ai-culture/screen/colossus.jpg', imageSource: 'https://www.themoviedb.org/movie/14801-colossus-the-forbin-project',
    source: 'https://www.universalpicturesathome.com/movies/colossus-the-forbin-project', sourceLabel: 'Universal Pictures',
    sourceQuote: 'the American government grants total control of its nuclear defenses to Colossus, an advanced supercomputer designed by Dr. Charles Forbin.',
    tags: ['nuclear command', 'machine rule', 'peace']
  },
  {
    id: 'after-yang', title: 'After Yang', medium: 'film', year: '2022',
    image: '/assets/ai-culture/screen/after-yang.jpg', imageSource: 'https://www.themoviedb.org/movie/585378-after-yang',
    source: 'https://a24films.com/films/after-yang', sourceLabel: 'A24',
    sourceQuote: 'When his young daughter’s beloved companion — an android named Yang — malfunctions, Jake (Colin Farrell) searches for a way to repair him.',
    tags: ['interior life', 'family', 'memory']
  },
  {
    id: 'i-am-mother', title: 'I Am Mother', medium: 'film', year: '2019',
    image: '/assets/ai-culture/screen/i-am-mother.jpg', imageSource: 'https://www.themoviedb.org/movie/505948-i-am-mother',
    source: 'https://media.netflix.com/en/only-on-netflix/80227090', sourceLabel: 'Netflix Media Center',
    sourceQuote: 'the first of a new generation of humans to be raised by Mother, a robot designed to repopulate the earth after the extinction of humankind.',
    tags: ['paternalism', 'repopulation', 'control']
  },
  {
    id: 'mars-express', title: 'Mars Express', medium: 'film', year: '2023',
    image: '/assets/ai-culture/screen/mars-express.jpg', imageSource: 'https://www.themoviedb.org/movie/586810-mars-express',
    source: 'https://gkids.com/films/mars-express/', sourceLabel: 'GKIDS',
    sourceQuote: 'In 2200, private detective Aline Ruby and her android partner Carlos Rivera are hired by a wealthy businessman to track down a notorious hacker.',
    tags: ['machine exit', 'labour', 'corporate power']
  },
  {
    id: 'wall-e', title: 'WALL·E', medium: 'film', year: '2008',
    image: '/assets/ai-culture/screen/wall-e.jpg', imageSource: 'https://www.themoviedb.org/movie/10681-wall-e',
    source: 'https://www.pixar.com/wall-e', sourceLabel: 'Pixar',
    sourceQuote: 'After hundreds of years doing what he was built for, WALL•E discovers a new purpose in life…',
    tags: ['automation', 'consumer society', 'initiative']
  }
];

function noteSlot(id) {
  const note = element('p', 'curator-note');
  note.dataset.noteId = id;
  note.hidden = true;
  return note;
}

function renderBook(item, index) {
  const card = element('article', 'culture-card');
  card.id = item.id;
  if (item.series) card.dataset.series = item.series;
  card.dataset.filterValues = `book ${item.tags.map((tag) => tag.replace(/\s+/g, '-')).join(' ')}`;
  card.dataset.search = [item.title, item.author, item.year, bookSeries[item.series]?.title, item.sourceQuote, ...item.tags].filter(Boolean).join(' ');

  const coverLink = externalLink('', item.source, 'culture-cover-link');
  const image = element('img');
  image.src = item.cover;
  image.alt = `Cover of ${item.title} by ${item.author}.`;
  image.loading = index < 4 ? 'eager' : 'lazy';
  image.decoding = 'async';
  coverLink.appendChild(image);
  card.appendChild(coverLink);

  const body = element('div', 'culture-body');
  const meta = element('div', 'culture-meta');
  meta.appendChild(element('span', '', 'Book'));
  meta.appendChild(element('span', '', item.year));
  body.appendChild(meta);
  body.appendChild(element('h2', '', item.title));
  body.appendChild(element('p', 'culture-author', item.author));
  body.appendChild(element('blockquote', 'source-description', item.sourceQuote));
  body.appendChild(externalLink(`${item.sourceLabel} ↗`, item.source, 'source-link'));
  const tags = element('div', 'culture-tags');
  item.tags.forEach((tag) => tags.appendChild(element('span', '', tag)));
  body.appendChild(tags);
  body.appendChild(noteSlot(item.id));
  card.appendChild(body);
  return card;
}

function renderSeries(seriesId, items) {
  const details = element('details', 'series-stack');
  details.dataset.seriesId = seriesId;

  const summary = element('summary', 'series-summary');
  const covers = element('span', 'series-covers');
  covers.setAttribute('aria-hidden', 'true');
  items.slice(0, 4).forEach((item, index) => {
    const image = element('img');
    image.src = item.cover;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.style.setProperty('--series-cover-index', index);
    covers.appendChild(image);
  });
  summary.appendChild(covers);

  const summaryCopy = element('span', 'series-summary-copy');
  summaryCopy.appendChild(element('span', 'series-label', 'Series'));
  summaryCopy.appendChild(element('strong', '', bookSeries[seriesId].title));
  summaryCopy.appendChild(element('span', 'series-author', bookSeries[seriesId].author));
  summary.appendChild(summaryCopy);
  summary.appendChild(element('span', 'series-count', `${items.length} books`));
  summary.appendChild(element('span', 'series-disclosure', '↓'));
  details.appendChild(summary);

  const grid = element('div', 'series-grid');
  items.forEach((item) => grid.appendChild(renderBook(item, books.indexOf(item))));
  details.appendChild(grid);
  return details;
}

function renderScreen(item) {
  const card = element('article', 'screen-card');
  card.id = item.id;
  card.dataset.filterValues = `${item.medium} ${item.tags.map((tag) => tag.replace(/\s+/g, '-')).join(' ')}`;
  card.dataset.search = [item.title, item.medium, item.year, item.sourceQuote, ...item.tags].join(' ');

  const imageLink = externalLink('', item.imageSource, 'screen-image-link');
  imageLink.setAttribute('aria-label', `View image source for ${item.title}.`);
  const image = element('img');
  image.src = item.image;
  image.alt = item.imageAlt || `Promotional image for ${item.title}.`;
  image.loading = 'lazy';
  image.decoding = 'async';
  imageLink.appendChild(image);
  card.appendChild(imageLink);

  const body = element('div', 'screen-body');
  const meta = element('div', 'screen-meta');
  meta.appendChild(element('span', '', item.medium === 'tv' ? 'Television' : 'Film'));
  meta.appendChild(element('span', '', item.year));
  body.appendChild(meta);
  body.appendChild(element('h2', '', item.title));
  body.appendChild(element('blockquote', 'source-description', item.sourceQuote));
  const tags = element('div', 'screen-tags');
  item.tags.forEach((tag) => tags.appendChild(element('span', '', tag)));
  body.appendChild(tags);
  body.appendChild(externalLink(`${item.sourceLabel} ↗`, item.source, 'source-link'));
  body.appendChild(noteSlot(item.id));
  card.appendChild(body);
  return card;
}

const bookGrid = document.querySelector('#book-grid');
const screenGrid = document.querySelector('#screen-grid');
const renderedSeries = new Set();
books.forEach((item, index) => {
  if (!item.series) {
    bookGrid?.appendChild(renderBook(item, index));
    return;
  }
  if (renderedSeries.has(item.series)) return;
  renderedSeries.add(item.series);
  bookGrid?.appendChild(renderSeries(item.series, books.filter((candidate) => candidate.series === item.series)));
});
screen.forEach((item) => screenGrid?.appendChild(renderScreen(item)));

const root = document.querySelector('#culture-items');
function syncSeriesStacks(query = '') {
  document.querySelectorAll('.series-stack').forEach((stack) => {
    const cards = Array.from(stack.querySelectorAll('.culture-card'));
    const hasVisibleCard = cards.some((card) => !card.hidden);
    stack.hidden = !hasVisibleCard;

    if (query && hasVisibleCard) {
      if (!stack.open) stack.dataset.openedBySearch = 'true';
      stack.open = true;
    } else if (!query && stack.dataset.openedBySearch === 'true') {
      stack.open = false;
      delete stack.dataset.openedBySearch;
    }
  });
}

function syncSections(event) {
  syncSeriesStacks(event?.detail?.query || '');
  document.querySelectorAll('[data-culture-section]').forEach((section) => {
    const cards = Array.from(section.querySelectorAll('.culture-card, .screen-card'));
    section.hidden = cards.length > 0 && cards.every((card) => card.hidden);
  });
}
root?.addEventListener('mint-gallery:updated', syncSections);

setupGallery({
  root: '#culture-items',
  cardSelector: '.culture-card, .screen-card',
  buttonSelector: '[data-filter-value]',
  searchSelector: '#collection-search',
  countSelector: '#collection-count',
  emptySelector: '#collection-empty'
});
syncSections();
showSubmissionReceipt();
loadCuratorNotes('/assets/collections/ai-culture-notes.json');
