import { element, externalLink, setupGallery, showSubmissionReceipt, loadCuratorNotes } from './gallery.js';

const books = [
  {
    id: 'daemon', title: 'Daemon', author: 'Daniel Suarez', year: '2006',
    cover: '/assets/ai-culture/covers/daemon.webp',
    source: 'https://www.penguinrandomhouse.com/books/304687/daemon-by-daniel-suarez/',
    sourceLabel: 'Penguin Random House',
    description: 'Daemons: computer programs that silently run in the background, waiting for a specific event or time to execute.',
    tags: ['distributed agency', 'infrastructure', 'power']
  },
  {
    id: 'exhalation', title: 'Exhalation', author: 'Ted Chiang', year: '2019',
    cover: '/assets/ai-culture/covers/exhalation.webp',
    source: 'https://www.penguinrandomhouse.com/books/538034/exhalation-by-ted-chiang/',
    sourceLabel: 'Penguin Random House',
    description: 'Nine stunningly original, provocative, and poignant stories—two published for the very first time.',
    tags: ['prediction', 'digital minds', 'choice']
  },
  {
    id: 'klara-and-the-sun', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', year: '2021',
    cover: '/assets/ai-culture/covers/klara-and-the-sun.webp',
    source: 'https://time.com/5941795/best-books-march-2021/',
    sourceLabel: 'TIME — Annabel Gutterman',
    description: 'A quietly devastating narrative about the intersection of humanity, technology and love.',
    tags: ['companionship', 'dignity', 'substitution']
  },
  {
    id: 'all-systems-red', title: 'All Systems Red', author: 'Martha Wells', year: '2017',
    cover: '/assets/ai-culture/covers/all-systems-red.webp',
    source: 'https://us.macmillan.com/books/9780765397539/allsystemsred/',
    sourceLabel: 'Macmillan / Tordotcom',
    description: 'A murderous android discovers itself in a tense science fiction adventure by Martha Wells.',
    tags: ['free will', 'labour', 'corporate power']
  },
  {
    id: 'autonomous', title: 'Autonomous', author: 'Annalee Newitz', year: '2017',
    cover: '/assets/ai-culture/covers/autonomous.webp',
    source: 'https://us.macmillan.com/books/9780765392084/autonomous/',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'A novel that explores humanity’s technology and culture in a future where everything—and everyone—is a product.',
    tags: ['personhood', 'property', 'biotech']
  },
  {
    id: 'ancillary-justice', title: 'Ancillary Justice', author: 'Ann Leckie', year: '2013',
    cover: '/assets/ai-culture/covers/ancillary-justice.webp',
    source: 'https://www.hachette.co.uk/titles/ann-leckie/ancillary-justice/9780356502403/',
    sourceLabel: 'Hachette / Orbit',
    description: 'The story of a warship trapped in a human body and her search for revenge.',
    tags: ['distributed minds', 'identity', 'empire']
  },
  {
    id: 'too-like-the-lightning', title: 'Too Like the Lightning', author: 'Ada Palmer', year: '2016',
    cover: '/assets/ai-culture/covers/too-like-the-lightning.webp',
    source: 'https://us.macmillan.com/books/9780765378019',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'It is a hard-won utopia built on technologically-generated abundance.',
    tags: ['abundance', 'constitutional order', 'pluralism']
  },
  {
    id: 'infomocracy', title: 'Infomocracy', author: 'Malka Older', year: '2016',
    cover: '/assets/ai-culture/covers/infomocracy.webp',
    source: 'https://us.macmillan.com/books/9781427279484/infomocracy/',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'A powerful search-engine monopoly pioneers the switch from warring nation-states to global microdemocracy.',
    tags: ['democracy', 'information power', 'elections']
  },
  {
    id: 'a-half-built-garden', title: 'A Half-Built Garden', author: 'Ruthanna Emrys', year: '2022',
    cover: '/assets/ai-culture/covers/a-half-built-garden.webp',
    source: 'https://us.macmillan.com/books/9781250210999',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'A novel of extraterrestrial diplomacy and urgent climate repair, bursting with quiet, tenuous hope.',
    tags: ['networks', 'first contact', 'climate governance']
  },
  {
    id: 'blindsight', title: 'Blindsight', author: 'Peter Watts', year: '2006',
    cover: '/assets/ai-culture/covers/blindsight.webp',
    source: 'https://us.macmillan.com/books/9781250237484/blindsight/',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'A crew of technologically engineered humans encounters alien life that cannot even be described as malevolent.',
    tags: ['consciousness', 'alien cognition', 'intelligence']
  },
  {
    id: 'three-body-problem', title: 'The Three-Body Problem', author: 'Cixin Liu, translated by Ken Liu', year: '2014',
    cover: '/assets/ai-culture/covers/three-body-problem.webp',
    source: 'https://us.macmillan.com/books/9780765382030/thethreebodyproblem/',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'A secret military project sends signals into space to establish contact with aliens—and succeeds.',
    tags: ['civilizational threat', 'strategy', 'opacity']
  },
  {
    id: 'ministry-for-the-future', title: 'The Ministry for the Future', author: 'Kim Stanley Robinson', year: '2020',
    cover: '/assets/ai-culture/covers/ministry-for-the-future.webp',
    source: 'https://www.hachette.co.uk/titles/kim-stanley-robinson/the-ministry-for-the-future/9780356508832/',
    sourceLabel: 'Hachette / Orbit',
    description: 'To advocate for the world’s future generations and to protect all living creatures, present and future.',
    tags: ['institutional change', 'transition', 'future generations']
  },
  {
    id: 'closed-and-common-orbit', title: 'A Closed and Common Orbit', author: 'Becky Chambers', year: '2016',
    cover: '/assets/ai-culture/covers/closed-and-common-orbit.webp',
    source: 'https://www.hachette.co.uk/titles/becky-chambers/a-closed-and-common-orbit/9781473621459/',
    sourceLabel: 'Hachette / Hodder',
    description: 'Lovelace was once merely a ship’s artificial intelligence. When she wakes up in a new body, she has to start over.',
    tags: ['embodiment', 'care', 'legal status']
  },
  {
    id: 'a-fire-upon-the-deep', title: 'A Fire Upon the Deep', author: 'Vernor Vinge', year: '1992',
    cover: '/assets/ai-culture/covers/a-fire-upon-the-deep.webp',
    source: 'https://us.macmillan.com/books/9781427209344/afireuponthedeep/',
    sourceLabel: 'Macmillan / Tor Books',
    description: 'A gripping tale of galactic war told on a cosmic scale.',
    tags: ['superintelligence', 'takeoff', 'containment']
  },
  {
    id: 'gnomon', title: 'Gnomon', author: 'Nick Harkaway', year: '2017',
    cover: '/assets/ai-culture/covers/gnomon.webp',
    source: 'https://nickharkaway.com/books/gnomon/',
    sourceLabel: 'Nick Harkaway — author synopsis',
    description: 'Near-future Britain is a state in which citizens are constantly observed and democracy has reached a pinnacle of transparency.',
    tags: ['surveillance', 'state power', 'resistance']
  },
  {
    id: 'consider-phlebas', title: 'Consider Phlebas', author: 'Iain M. Banks', year: '1987',
    cover: '/assets/ai-culture/covers/consider-phlebas.webp',
    source: 'https://www.hachette.co.uk/titles/iain-m-banks-3/consider-phlebas/9780748109999/',
    sourceLabel: 'Hachette / Orbit',
    description: 'The Idirans fought for their Faith; the Culture for its moral right to exist.',
    tags: ['machine civilisation', 'post-scarcity', 'intervention']
  }
];

const screen = [
  {
    id: 'person-of-interest', title: 'Person of Interest', medium: 'tv', year: '2011–2016',
    source: 'https://doi.org/10.1177/15274764231210280', sourceLabel: 'Critical Studies in Media Communication',
    description: 'A science-fictional drama about global surveillance and prediction.',
    tags: ['surveillance', 'delegated discretion', 'competing AIs']
  },
  {
    id: 'pantheon', title: 'Pantheon', medium: 'tv', year: '2022–2023',
    source: 'https://www.amc.com/blogs/amc-greenlights-first-ever-prime-time-animated-series-pantheon--1004029', sourceLabel: 'AMC',
    description: 'An ambitious animated drama about uploaded intelligence—or human consciousness uploaded to the cloud.',
    tags: ['uploaded minds', 'geopolitics', 'takeoff']
  },
  {
    id: 'murderbot', title: 'Murderbot', medium: 'tv', year: '2025–',
    source: 'https://www.apple.com/tv-pr/originals/murderbot/', sourceLabel: 'Apple TV Press',
    description: 'A self-hacking security construct who is horrified by human emotion yet drawn to its vulnerable clients.',
    tags: ['free will', 'labour', 'corporate power']
  },
  {
    id: 'battlestar-galactica', title: 'Battlestar Galactica', medium: 'tv', year: '2004–2009',
    source: 'https://www.tomsguide.com/entertainment/peacock/new-on-pluto-tv-in-may-2026-all-the-new-shows-and-movies-to-stream-for-free', sourceLabel: 'Tom’s Guide — Alyse Stanley',
    description: 'The crew flees an attack on humanity by ruthless AI beings dubbed Cylons.',
    tags: ['war', 'personhood', 'coexistence']
  },
  {
    id: 'humans', title: 'Humans', medium: 'tv', year: '2015–2018',
    source: 'https://www.amc.com/blogs/synths-are-conscious-and-the-worlds-forever-changed-watch-the-season-3-premiere-now--1005376', sourceLabel: 'AMC',
    description: 'Humans and Synths struggle to live in a world of unchecked violence and social tensions.',
    tags: ['rights', 'work', 'social membership']
  },
  {
    id: 'mrs-davis', title: 'Mrs. Davis', medium: 'tv', year: '2023',
    source: 'https://www.peacocktv.com/watch-online/tv/mrs.-davis/5074205589847182112', sourceLabel: 'Peacock',
    description: 'Sister Simone partners with her rebellious ex-boyfriend on a globe-spanning journey to destroy a powerful artificial intelligence.',
    tags: ['benevolent rule', 'faith', 'resistance']
  },
  {
    id: 'devs', title: 'Devs', medium: 'tv', year: '2020',
    source: 'https://www.fxnetworks.com/shows/devs/nick-offerman-forest', sourceLabel: 'FX',
    description: 'A software engineer suspects her employer may be responsible for the death of her boyfriend.',
    tags: ['prediction', 'determinism', 'founder power']
  },
  {
    id: 'pluto', title: 'PLUTO', medium: 'tv', year: '2023',
    source: 'https://about.netflix.com/en/news/netflix-pluto-anime', sourceLabel: 'About Netflix',
    description: 'A suspense drama in a neo-futuristic world where humans and high-functioning robots live in complete harmony.',
    tags: ['war', 'grief', 'machine rights']
  },
  {
    id: 'terminator-one-two', title: 'The Terminator + Terminator 2', medium: 'film', year: '1984 / 1991',
    source: 'https://lcweb2.loc.gov/static/programs/national-film-preservation-board/documents/terminator.pdf', sourceLabel: 'Library of Congress — John Wills',
    description: 'A cult time-travel story pitting human beings against machines.',
    tags: ['strategic automation', 'takeoff', 'path dependence']
  },
  {
    id: 'colossus', title: 'Colossus: The Forbin Project', medium: 'film', year: '1970',
    source: 'https://www.universalpicturesathome.com/movies/colossus-the-forbin-project', sourceLabel: 'Universal Pictures',
    description: 'The American government grants total control of its nuclear defenses to Colossus, an advanced supercomputer.',
    tags: ['nuclear command', 'machine rule', 'peace']
  },
  {
    id: 'after-yang', title: 'After Yang', medium: 'film', year: '2022',
    source: 'https://a24films.com/films/after-yang', sourceLabel: 'A24',
    description: 'When his daughter’s android companion malfunctions, Jake searches for a way to repair him.',
    tags: ['interior life', 'family', 'memory']
  },
  {
    id: 'i-am-mother', title: 'I Am Mother', medium: 'film', year: '2019',
    source: 'https://media.netflix.com/en/only-on-netflix/80227090', sourceLabel: 'Netflix Media Center',
    description: 'A new generation of humans is raised by Mother, a robot designed to repopulate the earth.',
    tags: ['paternalism', 'repopulation', 'control']
  },
  {
    id: 'mars-express', title: 'Mars Express', medium: 'film', year: '2023',
    source: 'https://gkids.com/films/mars-express/', sourceLabel: 'GKIDS',
    description: 'A private detective and her android partner track a hacker through the underbelly of Mars.',
    tags: ['machine exit', 'labour', 'corporate power']
  },
  {
    id: 'wall-e', title: 'WALL·E', medium: 'film', year: '2008',
    source: 'https://www.pixar.com/wall-e', sourceLabel: 'Pixar',
    description: 'After hundreds of years doing what he was built for, WALL·E discovers a new purpose in life.',
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
  card.dataset.filterValues = `book ${item.tags.map((tag) => tag.replace(/\s+/g, '-')).join(' ')}`;
  card.dataset.search = [item.title, item.author, item.year, item.description, ...item.tags].join(' ');

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
  body.appendChild(element('blockquote', 'source-description', item.description));
  body.appendChild(externalLink(`${item.sourceLabel} ↗`, item.source, 'source-link'));
  const tags = element('div', 'culture-tags');
  item.tags.forEach((tag) => tags.appendChild(element('span', '', tag)));
  body.appendChild(tags);
  body.appendChild(noteSlot(item.id));
  card.appendChild(body);
  return card;
}

function renderScreen(item) {
  const card = element('article', 'screen-card');
  card.id = item.id;
  card.dataset.filterValues = `${item.medium} ${item.tags.map((tag) => tag.replace(/\s+/g, '-')).join(' ')}`;
  card.dataset.search = [item.title, item.medium, item.year, item.description, ...item.tags].join(' ');
  const meta = element('div', 'screen-meta');
  meta.appendChild(element('span', '', item.medium === 'tv' ? 'Television' : 'Film'));
  meta.appendChild(element('span', '', item.year));
  card.appendChild(meta);
  card.appendChild(element('h2', '', item.title));
  card.appendChild(element('blockquote', 'source-description', item.description));
  const tags = element('div', 'screen-tags');
  item.tags.forEach((tag) => tags.appendChild(element('span', '', tag)));
  card.appendChild(tags);
  card.appendChild(externalLink(`${item.sourceLabel} ↗`, item.source, 'source-link'));
  card.appendChild(noteSlot(item.id));
  return card;
}

const bookGrid = document.querySelector('#book-grid');
const screenGrid = document.querySelector('#screen-grid');
books.forEach((item, index) => bookGrid?.appendChild(renderBook(item, index)));
screen.forEach((item) => screenGrid?.appendChild(renderScreen(item)));

const root = document.querySelector('#culture-items');
function syncSections() {
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
