// Bundled KJV verses (public domain) for the daily Word. Deterministic by
// calendar day so everyone gets the same passage. Expandable; the full ~1000-verse
// set + a Bible API reader come next.
export interface Verse { ref: string; text: string; theme: string }

export const VERSES: Verse[] = [
  { ref: "Joshua 1:9", theme: "Courage", text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
  { ref: "Philippians 4:13", theme: "Strength", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Isaiah 40:31", theme: "Endurance", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
  { ref: "2 Timothy 1:7", theme: "Power", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
  { ref: "Proverbs 27:17", theme: "Brotherhood", text: "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend." },
  { ref: "1 Corinthians 16:13", theme: "Vigilance", text: "Watch ye, stand fast in the faith, quit you like men, be strong." },
  { ref: "Romans 8:31", theme: "Assurance", text: "What shall we then say to these things? If God be for us, who can be against us?" },
  { ref: "Psalm 18:32", theme: "Strength", text: "It is God that girdeth me with strength, and maketh my way perfect." },
  { ref: "Matthew 6:33", theme: "Priority", text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
  { ref: "James 1:12", theme: "Endurance", text: "Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him." },
  { ref: "Galatians 6:9", theme: "Perseverance", text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not." },
  { ref: "Psalm 23:4", theme: "Fearlessness", text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
  { ref: "1 Peter 5:8", theme: "Vigilance", text: "Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about, seeking whom he may devour." },
  { ref: "Ephesians 6:11", theme: "Armor", text: "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil." },
  { ref: "Hebrews 12:1", theme: "The Race", text: "Let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us." },
  { ref: "Proverbs 3:5-6", theme: "Trust", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." },
  { ref: "Psalm 1:1-2", theme: "The Way", text: "Blessed is the man that walketh not in the counsel of the ungodly... but his delight is in the law of the LORD; and in his law doth he meditate day and night." },
  { ref: "1 Corinthians 9:27", theme: "Discipline", text: "But I keep under my body, and bring it into subjection: lest that by any means, when I have preached to others, I myself should be a castaway." },
  { ref: "Micah 6:8", theme: "The Walk", text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?" },
  { ref: "Joshua 24:15", theme: "Decision", text: "Choose you this day whom ye will serve; ... but as for me and my house, we will serve the LORD." },
  { ref: "Psalm 27:1", theme: "Fearlessness", text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?" },
  { ref: "Romans 12:2", theme: "Renewal", text: "And be not conformed to this world: but be ye transformed by the renewing of your mind." },
  { ref: "Colossians 3:23", theme: "Work", text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men." },
  { ref: "Deuteronomy 31:6", theme: "Courage", text: "Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee." },
  { ref: "Psalm 46:1", theme: "Refuge", text: "God is our refuge and strength, a very present help in trouble." },
  { ref: "John 16:33", theme: "Victory", text: "In the world ye shall have tribulation: but be of good cheer; I have overcome the world." },
  { ref: "2 Corinthians 12:9", theme: "Grace", text: "My grace is sufficient for thee: for my strength is made perfect in weakness." },
  { ref: "Psalm 119:9", theme: "Purity", text: "Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word." },
  { ref: "Matthew 5:14-16", theme: "Light", text: "Ye are the light of the world... Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven." },
  { ref: "1 John 5:4", theme: "Victory", text: "For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith." },
  { ref: "Proverbs 4:23", theme: "The Heart", text: "Keep thy heart with all diligence; for out of it are the issues of life." },
  { ref: "Isaiah 41:10", theme: "Strength", text: "Fear thou not; for I am with thee... I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness." },
  { ref: "Lamentations 3:22-23", theme: "Mercy", text: "It is of the LORD's mercies that we are not consumed... They are new every morning: great is thy faithfulness." },
  { ref: "Ephesians 4:1", theme: "The Calling", text: "I therefore... beseech you that ye walk worthy of the vocation wherewith ye are called." },
  { ref: "Psalm 144:1", theme: "The Fight", text: "Blessed be the LORD my strength, which teacheth my hands to war, and my fingers to fight." },
  { ref: "1 Timothy 4:8", theme: "Training", text: "For bodily exercise profiteth little: but godliness is profitable unto all things, having promise of the life that now is, and of that which is to come." },
  { ref: "Hebrews 10:24-25", theme: "Brotherhood", text: "And let us consider one another to provoke unto love and to good works: not forsaking the assembling of ourselves together." },
  { ref: "Psalm 37:23-24", theme: "The Path", text: "The steps of a good man are ordered by the LORD... Though he fall, he shall not be utterly cast down: for the LORD upholdeth him with his hand." },
  { ref: "Mark 8:34", theme: "The Cost", text: "Whosoever will come after me, let him deny himself, and take up his cross, and follow me." },
  { ref: "Nehemiah 8:10", theme: "Joy", text: "Neither be ye sorry; for the joy of the LORD is your strength." },
];

/** Days since epoch -> deterministic verse for "today". */
export function verseForDay(date = new Date()): Verse {
  const day = Math.floor(date.getTime() / 86400000);
  return VERSES[day % VERSES.length];
}
