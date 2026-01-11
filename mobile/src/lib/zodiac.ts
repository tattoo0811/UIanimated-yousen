export type ZodiacSign = {
    id: string;
    name: string;
    symbol: string;
    dateRange: string;
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    keywords: string[];
    description: string;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
    {
        id: 'aries',
        name: 'Aries',
        symbol: '♈',
        dateRange: 'Mar 21 - Apr 19',
        element: 'Fire',
        keywords: ['Courageous', 'Determined', 'Confident'],
        description: "The pioneer of the zodiac, Aries is bold and ambitious, diving headfirst into even the most challenging situations."
    },
    {
        id: 'taurus',
        name: 'Taurus',
        symbol: '♉',
        dateRange: 'Apr 20 - May 20',
        element: 'Earth',
        keywords: ['Reliable', 'Patient', 'Practical'],
        description: "Taurus is an Earth sign represented by the Bull. They are known for being practical, reliable, and devoted."
    },
    {
        id: 'gemini',
        name: 'Gemini',
        symbol: '♊',
        dateRange: 'May 21 - Jun 20',
        element: 'Air',
        keywords: ['Gentle', 'Affectionate', 'Curious'],
        description: "Expressive and quick-witted, Gemini represents two different personalities in one and you will never be sure which one you will face."
    },
    {
        id: 'cancer',
        name: 'Cancer',
        symbol: '♋',
        dateRange: 'Jun 21 - Jul 22',
        element: 'Water',
        keywords: ['Tenacious', 'Imaginative', 'Loyal'],
        description: "Deeply intuitive and sentimental, Cancer can be one of the most challenging zodiac signs to get to know."
    },
    {
        id: 'leo',
        name: 'Leo',
        symbol: '♌',
        dateRange: 'Jul 23 - Aug 22',
        element: 'Fire',
        keywords: ['Creative', 'Passionate', 'Generous'],
        description: "People born under the sign of Leo are natural born leaders. They are dramatic, creative, self-confident, dominant and extremely difficult to resist."
    },
    {
        id: 'virgo',
        name: 'Virgo',
        symbol: '♍',
        dateRange: 'Aug 23 - Sep 22',
        element: 'Earth',
        keywords: ['Loyal', 'Analytical', 'Kind'],
        description: "Virgos are always paying attention to the smallest details and their deep sense of humanity makes them one of the most careful signs of the zodiac."
    },
    {
        id: 'libra',
        name: 'Libra',
        symbol: '♎',
        dateRange: 'Sep 23 - Oct 22',
        element: 'Air',
        keywords: ['Cooperative', 'Diplomatic', 'Gracious'],
        description: "People born under the sign of Libra are peaceful, fair, and they hate being alone."
    },
    {
        id: 'scorpio',
        name: 'Scorpio',
        symbol: '♏',
        dateRange: 'Oct 23 - Nov 21',
        element: 'Water',
        keywords: ['Resourceful', 'Brave', 'Passionate'],
        description: "Scorpio is a Water sign and lives to experience and express emotions. Although emotions are very important for Scorpio, they manifest them differently than other water signs."
    },
    {
        id: 'sagittarius',
        name: 'Sagittarius',
        symbol: '♐',
        dateRange: 'Nov 22 - Dec 21',
        element: 'Fire',
        keywords: ['Generous', 'Idealistic', 'Humorous'],
        description: "Curious and energetic, Sagittarius is one of the biggest travelers among all zodiac signs."
    },
    {
        id: 'capricorn',
        name: 'Capricorn',
        symbol: '♑',
        dateRange: 'Dec 22 - Jan 19',
        element: 'Earth',
        keywords: ['Responsible', 'Disciplined', 'Self-control'],
        description: "Capricorn is a sign that represents time and responsibility, and its representatives are traditional and often very serious by nature."
    },
    {
        id: 'aquarius',
        name: 'Aquarius',
        symbol: '♒',
        dateRange: 'Jan 20 - Feb 18',
        element: 'Air',
        keywords: ['Progressive', 'Original', 'Independent'],
        description: "Aquarius-born are shy and quiet , but on the other hand they can be eccentric and energetic."
    },
    {
        id: 'pisces',
        name: 'Pisces',
        symbol: '♓',
        dateRange: 'Feb 19 - Mar 20',
        element: 'Water',
        keywords: ['Compassionate', 'Artistic', 'Intuitive'],
        description: "Pisces are very friendly, so they often find themselves in a company of very different people."
    },
];
