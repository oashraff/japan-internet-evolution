// server.js
// This file contains the Node.js server code that provides API endpoints for event details,
// Academic research (via OpenAlex), news & media, notable figures, and multimedia content to support the Knowledge Hub page.

const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch'); 
const app = express();
const port = process.env.PORT || 3000;

// Enable JSON body parsing for POST requests & CORS
app.use(cors());
app.use(express.json());

// Serve static files from the "images" folder under the '/images' route
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, '.')));
app.use(express.static(path.join(__dirname, '../')));

// In-memory data store for event details
const eventDetails = [
  {
    id: 1,
    title: "Broadband Expansion in Japan",
    year: "2005",
    description: "The transition from limited dial-up access to widespread high-speed broadband was a crucial milestone in Japan's digital revolution.",
    analysis: "Japan's broadband transformation by 2005 marked a significant milestone in digital infrastructure development. According to the Ministry of Internal Affairs and Communications (2020), aggressive policies and investments led to widespread fiber-optic deployment, achieving one of the highest broadband penetration rates globally. As detailed by Naito & Hausman (2005), Japan's ICT initiatives established innovative frameworks for future digital advancements, influencing both technological infrastructure and socio-economic development. This period saw broadband become an integral part of Japanese society, fundamentally changing how people accessed information and services.\n\nThe Ministry's data further revealed that by 2005, Japan had achieved remarkable broadband adoption rates, with fiber-optic penetration reaching unprecedented levels in urban areas. Naito & Hausman's research highlighted how government policies, particularly the e-Japan Strategy, created a competitive market environment that drove down costs while improving service quality, making high-speed internet accessible to a broader population segment.",
    images: [
      {
        url: "/images/analysis/broadband1.jpg",
        caption: "Evolution of Broadband Adoption (2001–2010)",
        imageSource: "Ministry of Internal Affairs and Communications et al. (2010)"
      },
      {
        url: "images/analysis/broadband2.jpg",
        caption: "Geographical Difference of Broadband Services (2010)",
        imageSource: "Ministry of Internal Affairs and Communications & Population Census (2010)"
      }
    ],
    citations: [
      {
        source: "Ministry of Internal Affairs and Communications, Japan",
        link: "https://www.soumu.go.jp/",
        date: "2020-05-01"
      },
      {
        source: "Naito, S. & Hausman, B. (2005). Information and Communications Technology in Japan: A general overview on the current Japnese initiatives and trends in the area of ICT",
        link: "https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=15bccb5ec718ecf91464d2d2b9014576d4e7a63a",
        date: "2005-05-01"
      }
    ],
    additionalInfo: "This event revolutionized Japan's connectivity, setting the stage for the mobile internet era and subsequent digital innovations."
  },
  {
    id: 2,
    title: "Mobile Internet Adoption",
    year: "2008",
    description: "The rapid adoption of mobile internet services redefined connectivity and digital culture in Japan.",
    analysis: "Research by Akiyoshi & Ono (2008) reveals that Japan's mobile internet adoption created a unique digital ecosystem, fundamentally transforming social and economic interactions. Their study in The Information Society journal documented how mobile internet diffusion patterns in Japan differed from global trends. This was further supported by Nagata's (2009) analysis in The Japan Times, which highlighted Japan's distinctive cell phone culture and its impact on social norms. The integration of mobile internet into daily life created new paradigms for communication and commerce, establishing patterns that would influence global mobile internet development.\n\nNagata's research particularly emphasized how Japan's early adoption of mobile internet services led to unique social phenomena, such as the emergence of mobile-first web design and novel communication patterns. The study highlighted how Japanese consumers' preference for mobile internet access shaped business strategies and service development, creating a model that would later influence global mobile internet trends.",
    images: [
      {
        url: "/images/analysis/mobile1.jpg",
        caption: "Mobile Internet Usage in Asian Countries in 2012",
        imageSource: "Nielsen & Statista (2012)"
      },
      {
        url: "/images/analysis/mobile2.jpg",
        caption: "Survey on How Frequently People Access Mobile Internet per Country",
        imageSource: "NAT Benchmark Survey, ET Benchmark Survey & APT Benchmark Survey (2010)"
      },
    ],
    citations: [
      {
        source: "Akiyoshi, M., & Ono, H. (2008). The Diffusion of Mobile Internet in Japan. The Information Society, 24(5), 292–303.",
        link: "https://www.tandfonline.com/doi/abs/10.1080/01972240802356067",
        date: "2008-09-27"
      },
      {
        source: "Nagata, K. (2009). Cell phone culture here unlike any other.",
        link: "https://www.japantimes.co.jp/news/2009/09/02/reference/cell-phone-culture-here-unlike-any-other/",
        date: "2009-09-02"
      }
    ],
    additionalInfo: "Mobile internet adoption redefined daily life in Japan, influencing everything from social media interactions to digital commerce."
  },
  {
    id: 3,
    title: "4G LTE Rollout",
    year: "2010",
    description: "The deployment of 4G LTE networks significantly improved mobile connectivity and enabled the rise of IoT.",
    analysis: "Suryanegara & Miyazaki's (2010) research highlighted how Japanese operators strategically approached 4G implementation in a mature market, focusing on service quality and innovation. Dateki et al. (2016) later demonstrated how this transition laid crucial groundwork for future 5G developments. The 4G LTE rollout marked a significant technological leap, enabling high-speed mobile data services that transformed how businesses and consumers accessed digital content. This infrastructure advancement catalyzed innovations in mobile services and applications, setting new standards for mobile connectivity.\n\nThe research by Dateki et al. specifically detailed how Japanese operators' experience with 4G deployment informed their approach to 5G planning. Their analysis showed how early challenges in 4G implementation, such as network optimization and coverage expansion, provided valuable lessons that would later benefit 5G rollout strategies.",
    images: [
      {
        url: "/images/analysis/japan-lte.jpg",
        caption: "Evolution of NTT DoCoMo LTE Subscribers (2010-2012)",
        imageSource: "TheNextWeb Blog (2012)"
      }
    ],
    citations: [
      {
        source: "Suryanegara, M., & Miyazaki, K. (2010). A challenge towards 4G: The strategic perspective of Japanese operators in a mature market.",
        link: "https://ieeexplore.ieee.org/abstract/document/5603375",
        date: "2010-10-14"
      },
      {
        source: "Dateki, T. et al. (2016). From LTE-Advanced to 5G: Mobile Access System in Progress",
        link: "https://www.fujipress.jp/jdr/dr/dsstr001300050957/",
        date: "2016-04-1"
      }
    ],
    additionalInfo: "The 4G LTE era was instrumental in enabling the next wave of mobile and IoT innovations in Japan."
  },
  {
    id: 4,
    title: "Emergence of IoT in Japan",
    year: "2013",
    description: "The integration of IoT devices into everyday life began reshaping urban infrastructure and consumer electronics in Japan.",
    analysis: "The European Technology Platform on Smart Systems Integration's 2008 report predicted IoT's transformative potential, which materialized in Japan through comprehensive integration across sectors. Kawamoto et al. (2014) documented how IoT adoption in Japan uniquely combined industrial efficiency with consumer applications. This dual focus on industrial and consumer IoT applications positioned Japan as a leader in smart city initiatives and automated systems, demonstrating how IoT could enhance both economic productivity and quality of life.\n\nKawamoto's research specifically highlighted Japan's distinctive approach to IoT implementation, emphasizing how cultural factors and existing technological infrastructure influenced adoption patterns. Their analysis revealed how Japan's experience with industrial automation created a foundation for rapid IoT integration, particularly in manufacturing and urban development contexts.",
    images: [
      {
        url: "/images/analysis/iot.png",
        caption: "Growth of IoT devices (1993-2020)",
        imageSource: "Mufti, T. - ResearchGate (2020)"
      }
    ],
    citations: [
      {
        source: "European Technology Platform on Smart Systems Integration (EPoSS). (2008). Internet of Things in 2020: Roadmap for the future",
        link: "https://docbox.etsi.org/erm/Open/CERP%2020080609-10/Internet-of-Things_in_2020_EC-EPoSS_Workshop_Report_2008_v1-1.pdf",
        date: "2008-05-27"
      },
      {
        source: "Kawamoto, Y. et al. (2014). Internet of Things (IoT): Present State and Future Prospects",
        link: "https://search.ieice.org/bin/pdf_link.php?category=D&lang=E&year=2014&fname=e97-d_10_2568&abst=",
        date: "2014-10-10"
      }
    ],
    additionalInfo: "The rise of IoT has not only transformed consumer lifestyles but has also enabled significant advancements in urban planning and industrial productivity."
  },
  {
    id: 5,
    title: "Cybersecurity Enhancements",
    year: "2018",
    description: "In response to growing digital threats, Japan significantly improved its cybersecurity measures to protect sensitive data and infrastructure.",
    analysis: "Mori & Goto's (2018) review of national cybersecurity strategies revealed Japan's comprehensive approach to digital security. The National Center of Incident Readiness and Strategy for Cybersecurity's 2018 report outlined how Japan strengthened its cybersecurity framework through public-private partnerships and international collaboration. These initiatives were particularly crucial in protecting critical infrastructure and ensuring secure digital transformation across sectors, while maintaining public trust in digital services.\n\nThe NICS report further detailed Japan's proactive stance on cybersecurity, highlighting specific measures implemented to protect critical infrastructure and prepare for the 2020 Olympics. The strategy emphasized the importance of international cooperation and information sharing, establishing Japan as a leader in cybersecurity innovation and policy development.",
    images: [
      {
        url: "/images/analysis/cybersecurity1.png",
        caption: "Japan Cybersecurity Market (2018-2030)",
        imageSource: "BlueWave Consulting (2022)"
      }
    ],
    citations: [
      {
        source: "Mori, S., & Goto, A. (2018). Reviewing National Cybersecurity Strategies",
        link: "https://www.fujipress.jp/jdr/dr/dsstr001300050957/",
        date: "2018-10-01"
      },
      {
        source: "The National Center of Incident Readiness and Strategy for Cybersecurity (NICS), Japan. (2018). Cybersecurity Strategy",
        link: "https://www.nisc.go.jp/eng/pdf/cs-senryaku2018-en.pdf",
        date: "2018-07-27"
      }
    ],
    additionalInfo: "Enhancements in cybersecurity have been pivotal in maintaining public trust and enabling secure innovation throughout Japan's digital transformation."
  },
  {
    id: 6,
    title: "5G Network Rollout",
    year: "2021",
    description: "The recent rollout of 5G networks has revolutionized connectivity with ultra-fast speeds and low latency.",
    analysis: "According to Knowledge Sourcing Intelligence's 2024 analysis, Japan's 5G ecosystem development has positioned the country at the forefront of next-generation connectivity. McKinsey & Company's 2018 study predicted how 5G would revolutionize sectors beyond traditional telecommunications. Their analysis proved accurate as 5G deployment has enabled innovations in areas such as autonomous vehicles, smart manufacturing, and augmented reality applications, fundamentally transforming both industry and consumer experiences.\n\nMcKinsey's research particularly emphasized how Japan's early investment in 5G infrastructure created opportunities for industrial innovation. The study detailed how Japanese companies leveraged 5G capabilities to develop new business models and enhance operational efficiency, setting benchmarks for global industry adoption of 5G technologies.",
    images: [
      {
        url: "/images/analysis/5g-rollout.webp",
        caption: "5G Availability: 2021 vs 2025 (Projected)",
        imageSource: "GSMA APAC 5G Forum (2024)"
      }
    ],
    citations: [
      {
        source: "Knowledge Sourcing Intelligence. (2024). The Development of 5G Ecosystem in Japan: A Road to Better Connectivity",
        link: "https://www.knowledge-sourcing.com/resources/thought-articles/the-development-of-5g-ecosystem-in-japan-a-road-to-better-connectivity/",
        date: "2024-04-18"
      },
      {
        source: "McKinsey & Company. (2018). Japan at a crossroads - The 4G to 5G (r)evolution",
        link: "https://www.mckinsey.com/~/media/mckinsey/industries/technology%20media%20and%20telecommunications/telecommunications/our%20insights/japan%20at%20a%20crossroads%20the%204g%20to%205g%20revolution/japan-at-a-crossroads-the-4g-to-5g-revolution-final-web.pdf",
        date: "2018-01-01"
      }
    ],
    additionalInfo: "The 5G rollout represents a significant leap in network capabilities, promising a future of enhanced digital experiences and innovative business models."
  }
];

// In-memory data store for notable figures per event.
const notableFigures = {
  1: [
    {
      name: "Masayoshi Son",
      role: "CEO, SoftBank Group Corp.",
      bio: "Masayoshi Son's SoftBank was a significant player in broadband by 2005, driving competition and expansion.",
      image: "/images/knowledge-hub/m-son.jpg",
      links: [
        { label: "SoftBank Group Profile", url: "https://group.softbank/en/about/officer/son" }
      ]
    }
  ],
  2: [
    {
      name: "Hiroshi Mikitani",
      role: "CEO, Rakuten",
      bio: "Pioneered mobile commerce and digital services, accelerating mobile internet adoption.",
      image: "/images/knowledge-hub/mikitani.jpg",
      links: [
        { label: "Rakuten Global Profile", url: "https://global.rakuten.com/corp/about/management.html" },
        { label: "Forbes Profile", url: "https://www.forbes.com/profile/hiroshi-mikitani/" }
      ]
    },
    {
      name: "Masayoshi Son",
      role: "CEO, SoftBank Group Corp.",
      bio: "Son played a key role in promoting mobile internet adoption.",
      image: "/images/knowledge-hub/m-son.jpg",
      links: [
        { label: "SoftBank Group Profile", url: "https://group.softbank/en/about/officer/son" }
      ]
    },
    {
      name: "Ryuji Yamada",
      role: "Former President & CEO, NTT DoCoMo",
      bio: "During his tenure, lead the largest mobile operator in Japan through the mobile internet transition.",
      image: "/images/knowledge-hub/r-yamada.webp",
      links: [
        { label: "Crunchbase Profile", url: "https://www.crunchbase.com/person/ryuji-yamada" }
      ]
    }
  ],
  3: [
    {
      name: "Masao Nakamura",
      role: "Former President & CEO, NTT DoCoMo",
      bio: "During the 4G LTE rollout, he spearheaded the company's advancements in mobile technology.",
      image: "/images/knowledge-hub/m-nakamura.jpg",
      links: [
        { label: "NTT Communications", url: "https://www.standard.co.uk/hp/front/docomo-of-japan-to-name-new-chief-6959952.html" }
      ]
    }
  ],
  4: [
    {
      name: "Jun Murai",
      role: "Father of Internet in Japan",
      bio: "Murai's early work laid the foundation for internet infrastructure, crucial for IoT emergence.",
      image: "/images/knowledge-hub/j-murai.webp",
      links: [
        { label: "Internet Hall of Fame Profile", url: "https://www.internethalloffame.org/inductee/jun-murai/" }
      ]
    }
  ],
  5: [
    {
      name: "Seiko Noda",
      role: "Former Minister of Internal Affairs and Communications",
      bio: "Noda was at the forefront of government initiatives to strengthen cybersecurity.",
      image: "/images/knowledge-hub/s-noda.jpg",
      links: [
        { label: "Official Website", url: "https://noda-seiko.gr.jp/" }
      ]
    },
    {
      name: "Nobuhiro Endo",
      role: "Former Chairman, NEC Corporation",
      bio: "Led the NEC Corporation, a major player in cybersecurity solutions in Japan, advocating for enhanced security measures",
      image: "/images/knowledge-hub/n-endo.jpg",
      links: [
        { label: "The World Economic Forum Profile", url: "https://www.weforum.org/stories/authors/nobuhiro-endo/" }
      ]
    }
  ],
  6: [
    {
      name: "Kazuhiro Yoshizawa",
      role: "Former President & CEO, NTT DoCoMO",
      bio: "Yoshizawa was responsible for leading the 5G network deployment and strategy.",
      image: "/images/knowledge-hub/k-yoshizawa.jpg",
      links: [
        { label: "GSMA Profile", url: "https://www.gsma.com/get-involved/working-groups/gsma_people/kazuhiro-yoshizawa-president/" }
      ]
    }
  ]
};

// In-memory data store for multimedia content per event.
const multimediaData = {
  1: [
    {
      videoTitle: "Why Japan's Internet is Weirdly Designed",
      videoEmbedUrl: "https://www.youtube.com/embed/z6ep308goxQ",
      description: "An analysis of Japan's unique internet web design."
    },
    {
      videoTitle: "Japan Was The First Nation To Embrance Internet Technology (2001)",
      videoEmbedUrl: "https://www.youtube.com/embed/5jLP_aa_juA",
      description: "An overview of Japan's Internet Technology."
    }
  ],
  2: [
    {
      videoTitle: "The Asian Mobile Broadband Revolution Explained",
      videoEmbedUrl: "https://www.youtube.com/embed/bNq6k6zZ-t8",
      description: "A talk on the mobile broadband revolution in Asia."
    }
  ],
  3: [
    {
      videoTitle: "NTT DoCoMo Vision 2010 Part I-1",
      videoEmbedUrl: "https://www.youtube.com/embed/eXuXBROyV-g",
      description: "An overview of NTT DoCoMo's vision for 4G LTE."
    }
  ],
  4: [
    {
      videoTitle: "IoT Solution Seminar Speech - Advantech Japan",
      videoEmbedUrl: "https://www.youtube.com/embed/_bMRvEqSE7I",
      description: "A seminar speech regarding IoT Solutions in Japan."
    }
  ],
  5: [
    {
      videoTitle: "Japan’s New Cybersecurity Strategy to Close an IoT Gap",
      videoEmbedUrl: "https://www.youtube.com/embed/XPh7L5SW-i8",
      description: "An insight on the new Cybersecurity Revolution in Japan."
    },
    {
      videoTitle: "Public Lecture Slides (4.4.2019) Cybersecurity and Concerns Related to Tokyo 2020",
      videoEmbedUrl: "https://www.youtube.com/embed/ZeWEsufXJc4",
      description: "A Lecture Event on Cybersecurity Concerns in Tokyo 2020 amid the introduction of the new cybersecurity strategy."
    }
  ],
  6: [
    {
      videoTitle: "Japan's Major Cellphone Carriers to Start 5G Services",
      videoEmbedUrl: "https://www.youtube.com/embed/yGVkRaCEDNM",
      description: "A news report on the launch of 5G services in Japan; marking it as one of the first nations to adopt 5G."
    }
  ]
};

// In-memory data store for News & Articles per event
const newsArticles = {
  1: [
    {
      id: 1,
      type: "news",
      title: "Rakuten and NTT DoCoMo to Form Strategic Alliance in Internet Auction Servicesation in Japan Announced",
      date: "2005-10-05",
      summary: "In 2005, Rakuten and NTT DoCoMo formed a strategic alliance to merge their PC-based and mobile auction services via a joint venture, leveraging Rakuten’s e-commerce expertise and DoCoMo’s mobile platform (i-mode®) to expand into Japan’s emerging mobile-commerce market.",
      link: "https://www.docomo.ne.jp/english/info/media_center/pr/2005/000691.html"
    },
    {
      id: 2,
      type: "article",
      title: "Understanding the Japanese Broadband the Japanese Broadband Miracle",
      date: "2007-04-04",
      summary: "Japan achieved global leadership in broadband innovation and accessibility by 2007 through competitive pricing, government strategies like the U-Japan initiative, infrastructure investments in FTTH and DSL, and advancements in mobile technology such as digital TV and e-payment systems.",
      link: "https://www2.itif.org/Ebihara_Japanese_Broadband.pdf"
    },
    {
      id: 3,
      type: "article",
      title: "Local Government Broadband Policies for Areas with Limited Internet Access",
      date: "2010-10-30",
      summary: "A study on Japan's local government broadband policies in underserved areas highlights the effectiveness of national-local collaboration, subsidies, and public-private partnerships via the IRU model in reducing geographical digital divides, though challenges persist in remote regions like small islands.",
      link: "https://www2.itif.org/Ebihara_Japanese_Broadband.pdf"
    },
    {
      id: 4,
      type: "article",
      title: "The Impact of Residential Broadband Traffic on Japanese ISP Backbones",
      date: "2005-01-01",
      summary: "A 2005 study analyzing traffic from seven major Japanese ISPs revealed that residential broadband usage, driven by peer-to-peer applications and evening peaks, dominated backbone networks with an estimated 250Gbps traffic, exhibiting unique patterns distinct from traditional office/academic usage and predicting similar global trends as broadband adoption expands.",
      link: "http://hiroshi1.hongo.wide.ad.jp/hiroshi/papers/2005/fce_ACM_Jan_2005.pdf"
    }
  ],
  2: [
    {
      id: 5,
      type: "news",
      title: "NTT DOCOMO Unveils 22 Handsets in Four All-new Series",
      date: "2008-11-05",
      summary: "A detailed article exploring the historical developments in Japan's internet infrastructure.",
      link: "https://www.docomo.ne.jp/english/info/media_center/pr/2008/001420.html"
    },
    {
      id: 6,
      type: "news",
      title: "Cell phone culture here unlike any other",
      date: "2009-09-02",
      summary: "The article examines how Japan's unique cell phone culture has evolved into a phenomenon unlike any found elsewhere.",
      link: "https://www.japantimes.co.jp/news/2009/09/02/reference/cell-phone-culture-here-unlike-any-other/"
    }
  ],
  3: [
    {
      id: 7,
      type: "news",
      title: "NTT DoCoMo to launch 4G mobile service in December 2010",
      date: "2009-11-17",
      summary: "Japan's top mobile carrier NTT DoCoMo pledged a ¥300 billion investment in 4G LTE technology in 2010, aiming to launch services by December 2010 and discontinue 2G networks by March 2011 to leverage LTE's faster speeds compared to 3G.",
      link: "https://www.marketwatch.com/story/ntt-docomo-to-launch-4g-mobile-service-in-december-2010-2009-11-17"
    },
    {
      id: 8,
      type: "news",
      title: "NTT Docomo Launches LTE Service",
      date: "2010-12-24",
      summary: "NTT DoCoMo launched Japan's first LTE service, Xi, on December 24, 2010, offering high-speed data connectivity in major cities and aiming to cover 70% of Japan's population by 2015, with plans for LTE-compatible handsets by 2012 and significant infrastructure investments to support cloud-based services.",
      link: "https://www.lightreading.com/2g-3g-4g/ntt-docomo-launches-lte-service"
    },
    {
      id: 9,
      type: "article",
      title: "Tracking the 4G Decade",
      date: "2020-01-23",
      summary: "Over the past decade, 4G LTE grew from a slow start in 2009 to dominate global mobile subscriptions, reaching 4.15 billion users by 2019. Notably, the first countries to start rolling out 4G were Norway and Sweden in 2009, with Germany, Japan, and the US following in 2010.",
      link: "https://blog.telegeography.com/tracking-the-4g-decade"
    }
  ],
  4: [
    {
      id: 10,
      type: "news",
      title: "Internet of Things, Industry 4.0 and the Role of Japan",
      date: "2020-10-29",
      summary: "Japan is well-positioned for the next industrial revolution with strengths in robotics, automation, and IT, but its companies must embrace open innovation, global leadership, and faster decision-making to compete with global tech giants and adapt to disruptive business models driven by the internet and platforms like Alibaba.",
      link: "https://www.japanindustrynews.com/2015/10/internet-of-things-industry-4-0-and-the-role-of-japan/"
    },
    {
      id: 11,
      type: "article",
      title: "The Internet of Things in Japan: A New Era of Connectivity",
      date: "2015-08-12",
      summary: "Japan's IoT market is poised for rapid growth, driven by smart homes, connected cars, and industrial automation, with key players like Hitachi, Panasonic, and Toyota leading the charge in developing innovative IoT solutions, but challenges remain in data security, interoperability, and regulatory frameworks.",
      link: "https://www.japanindustrynews.com/2015/08/the-internet-of-things-in-japan-a-new-era-of-connectivity/"
    }
  ],
  5: [
    {
      id: 12,
      type: "news",
      title: "Japan emphasises Olympics cybersecurity, condemns 'malicious' hacks",
      date: "2020-10-20",
      summary: "Japan pledged to strengthen cybersecurity for the Tokyo Olympics after the U.S. and UK accused Russian military intelligence of attempting to disrupt the Games, with organizers reporting no significant impact but emphasizing the importance of robust cyber defenses..",
      link: "https://www.reuters.com/article/sports/japan-emphasises-olympics-cybersecurity-condemns-malicious-hacks-idUSL4N2HB1C1/"
    },
    {
      id: 13,
      type: "article",
      title: "Summary of the Japan‘s Cybersecurity Strategy",
      date: "2018-07-27",
      summary: "Japan's 2018 Cybersecurity Strategy outlines a comprehensive plan to ensure a secure cyberspace by promoting public-private collaboration, advancing cybersecurity as a driver of socio-economic value, protecting critical infrastructure, and fostering international cooperation, with a focus on achieving sustainable development and safeguarding the Tokyo 2020 Olympics.",
      link: "https://www.nisc.go.jp/eng/pdf/cs-senryaku2018-shousaigaiyou-en.pdf"
    },
    {
      id: 14,
      type: "article",
      title: "How is Japan embracing the relevance of cyber security?",
      date: "2022-11-21",
      summary: "Awareness of cybersecurity in Japan has grown significantly, with CEOs increasingly recognizing cyber threats as critical disruptors, but companies face challenges in implementing robust cybersecurity measures and addressing talent shortages due to conservative work culture and reliance on IT departments.",
      link: "https://www.computerfutures.com/en-jp/knowledge-hub/cyber-security/how-is-japan-embracing-the-relevance-of-cyber-security/"
    },
    {
      id: 15,
      type: "article",
      title: "FTC Workshop: Internet of Things - Section 2 Transcript",
      date: "2013-11-19",
      summary: "The transcript discusses the Internet of Things, highlighting its potential for optimization and innovation across various sectors, while also addressing challenges related to standards, privacy, security, and the digital divide.",
      link: "https://www.ftc.gov/sites/default/files/documents/videos/internet-things-privacy-security-connected-world-workshop-part-2/ftc_internet_of_things_-_transcript_segment_2.pdf"
    }
  ],
  6: [
    {
      id: 16,
      type: "news",
      title: "Fujitsu and Trend Micro Demonstrate Solution To Secure Private 5G",
      date: "2021-04-08",
      summary: "Fujitsu and Trend Micro have partnered to enhance cybersecurity for private 5G networks in smart factories, demonstrating a solution that detects and blocks threats in real-time, with plans to commercialize the technology based on field trial results.",
      link: "https://newsroom.trendmicro.com/2021-04-08-Fujitsu-and-Trend-Micro-Demonstrate-Solution-To-Secure-Private-5G"
    },
    {
      id: 17,
      type: "news",
      title: "Japanese operators launched 5G services",
      date: "2020-04-06",
      summary: "Three out of four major Japanese mobile service providers launched 5G services in late March 2020, with Rakuten Mobile planning to join in June, while KDDI and SoftBank aim to accelerate rural 5G rollout through a joint venture called '5G JAPAN'.",
      link: "https://5gobservatory.eu/japanese-operators-launched-5g-services/"
    }
  ]
  
};

/**
 * GET /api/event-details
 * Returns a list of all detailed event information.
 */
app.get('/api/event-details', (req, res) => {
  res.status(200).json({
    success: true,
    count: eventDetails.length,
    events: eventDetails
  });
});

/**
 * GET /api/event-details/:id
 * Returns detailed information for a specific event based on its ID.
 */
app.get('/api/event-details/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid event ID. Please provide a numeric value."
    });
  }
  const event = eventDetails.find(ev => ev.id === eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      error: "Event not found. Please verify the event ID and try again."
    });
  }
  res.status(200).json({
    success: true,
    event: event
  });
});

/**
 * GET /api/research?event=EVENT_ID
 * Returns a list of academic works related to a specific event.
 */
app.get('/api/research', async (req, res) => {
  const eventId = parseInt(req.query.event, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing event parameter."
    });
  }

  const event = eventDetails.find(ev => ev.id === eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      error: "Event not found."
    });
  }

  // Use the event title as a query to retrieve relevant academic works via OpenAlex.
  const query = encodeURIComponent(event.title);
  const perPage = 5;
  const openAlexUrl = `https://api.openalex.org/works?search=${query}&filter=authorships.institutions.country_code:jp|primary_location.source.country_code:jp&per-page=${perPage}`;

  try {
    const openAlexResponse = await fetch(openAlexUrl);
    if (!openAlexResponse.ok) {
      throw new Error(`OpenAlex API responded with status ${openAlexResponse.status}`);
    }
    const openAlexData = await openAlexResponse.json();

    const articles = openAlexData.results.map(result => ({
      title: result.display_name || "Untitled",
      date: result.publication_date || "Unknown",
      link: result.primary_location?.source?.url || result.doi || result.id,
      institutions: result.authorships
        ?.map(a => a.institutions?.map(inst => inst.display_name))
        .flat()
        .filter(name => name)
    }));

    return res.status(200).json({ success: true, articles });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notable-figures?event=EVENT_ID
 * Returns data on notable figures associated with a specific event.
 */
app.get('/api/notable-figures', (req, res) => {
  const eventId = parseInt(req.query.event, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing event parameter."
    });
  }

  const figures = notableFigures[eventId];
  if (!figures) {
    return res.status(404).json({
      success: false,
      error: "No notable figures found for this event."
    });
  }

  return res.status(200).json({
    success: true,
    figures: figures
  });
});

/**
 * GET /api/multimedia?event=EVENT_ID
 * Returns a list of multimedia content (YouTube videos) for a specific event.
 */
app.get('/api/multimedia', (req, res) => {
  const eventId = parseInt(req.query.event, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing event parameter."
    });
  }

  const multimedia = multimediaData[eventId];
  if (!multimedia) {
    return res.status(404).json({
      success: false,
      error: "No multimedia content found for this event."
    });
  }

  return res.status(200).json({
    success: true,
    multimedia: multimedia
  });
});

/**
 * GET /api/news-articles/?event=EVENT_ID
 * Returns news and articles information for a specific event based on its ID.
 */
app.get('/api/news-articles', (req, res) => {
  const eventId = parseInt(req.query.event, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing event parameter."
    });
  }
  // Retrieve articles for the event (or return an empty array if none exist)
  const articles = newsArticles[eventId] || [];
  return res.status(200).json({ success: true, articles });
});

/**
 * 404 Handler for Undefined Routes
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found."
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error."
  });
});

// Port configuration
const PORT = process.env.PORT || 3000;

// For Render's zero-downtime deployments
process.on('SIGINT', () => {
  console.log('Server shutting down');
  process.exit(0);
});

// Start the API server
app.listen(process.env.PORT, () => {
  console.log(`API server is running on port ${process.env.PORT}`);
});
