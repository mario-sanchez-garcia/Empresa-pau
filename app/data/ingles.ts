import { examenesInglesCataluna } from "./ingles_cataluna"

export type DiaIngles = "Lunes" | "Martes" | "9:30" | "12:00" | `Sèrie ${number} - A`
export type OpcionIngles = "A" | "B" | "Única"

export interface PreguntaIngles {
  id: string
  numero: number
  bloque: string
  label: string
  tema: string
  puntuacion: number
  enunciado: string
  criterios: string
  texto_fuente?: string
  requiereRevision?: boolean
  topicSlugs?: string[]
}

export interface ExamenIngles {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria" | "Modelo"
  convocatoria: "Ordinaria" | "Extraordinaria" | "Modelo"
  opcion: OpcionIngles
  dia?: DiaIngles
  asignatura: "Inglés"
  comunidad: "Madrid" | "Cataluña"
  titulo: string
  fuenteDocumento?: string
  preguntas: PreguntaIngles[]
}

// ─── Reading passages ────────────────────────────────────────────────────────

const t1718A = `Romanian's Medieval Marital Prison

Biertan is a Transylvanian village that feels frozen in time. Horse-drawn carts are still a part of daily life, and local residents gather to trade their wares in a cobbled village square. At the heart of the village, next to a 15th-century fortified church that stands on a hill, there is a small building with a very small room. For 300 years, couples whose marriages were on the rocks would find themselves here, locked away for up to six weeks by the local bishop in hope that they would iron out their problems and avert a divorce.

It may sound like a nightmare, but records show that this form of marriage counselling in Transylvania was rather effective. "Thanks to this blessed building, in the 300 years that Biertan had the bishop's seat, we only had one divorce," said Biertan's current priest. Today, the small, dark prison is a museum. The room has low ceilings and thick walls, and is equipped with a table and chair, a storage chest and a bed that looks small enough to belong to a child. As couples attempted to repair their marriages inside this tiny space, everything had to be shared, from a single pillow and blanket to the lone table setting.

Lutheranism was the religion that governed most aspects of Biertan's life. Although divorce was allowed under certain circumstances, such as adultery, it was preferred that couples attempt to save their union. So, a couple seeking divorce would voluntarily visit the bishop, who would send them to the marital prison to see if their differences could be reconciled before they parted ways. The prison was then an instrument to keep society in the old Christian order. It also protected women and children, who were dependent on the family unit to survive.`

const t1718B = `Clara Barton: American Red Cross Founder

Clara Barton was born on December 25, 1821 in Massachusetts. As the youngest of five children, young Clara often felt as if she had six parents instead of two. Her older sisters were schoolteachers and they taught her everything they knew since they found the little girl to be an eager pupil.

In April 1860, the Civil War began. She asked the War Department if she could go to the battlefield to distribute medicine and food to the troops. Imagine their shock! No unmarried woman had ever gone to the battlefield before, but Barton was determined to go and she didn't stop until someone gave her permission. She had found a way to serve her country. Her work of soliciting and distributing supplies, as well as nursing the wounded was gruelling. She often criticized the Army about the lack of food and supplies for the fighting men. When the war was about to finish, she also set up an office to sort out the difficult business of locating and identifying prisoners, missing men, and the dead buried in unmarked graves. But she was ordered to go to Europe by her doctor for a rest cure in 1869.

While abroad, Barton came into contact with the International Committee of the Red Cross. After recovering, she returned to the USA and campaigned to establish an American branch of the Red Cross. In 1882, the US Senate ratified the Geneva Convention, forming the American Association of the Red Cross. Then, Barton became its president. Her subsequent domestic program was impressive. Her energy and commitment to humanitarian causes over a forty-year period made her a household name, a symbol of charitable self-sacrifice. However, her inflexibility forced her to resign in 1904 from the organization she had founded and built. Nevertheless, Barton remained active in relief work until her death in 1912 at the age of ninety-one.`

const t1819A = `Homesickness

Whether you've gone away to college, moved to a new city or even just travelled for vacation, homesickness is a common emotional experience. Longing for home is the subject of books, songs and films. Celebrities have opened up about feeling homesick, and many people have shared their tips for overcoming it.

But what exactly are we feeling when we experience homesickness and why do we feel it so deeply – in a way that sometimes manifests physically? Joshua Klapow, a professor of public health at the University of Alabama, points out that "homesickness has everything to do with attachment". When we feel homesick, we're feeling insecure or uncomfortable with where we are, physically and emotionally, he adds. "We're longing for something that in our minds is known, predictable, consistent and stable."

Other psychologists emphasise that homesickness is a very normal part of the human experience and is about overcoming a period of adjustment to a new environment. To get over it, homesick people are encouraged to find a coffee shop or another place they can visit repeatedly and that will start to feel familiar. Over time, they will form new attachments.

Even though it's normal and common, homesickness can be associated with very difficult emotions and experiences, according to Ricks Warren, an associate professor in the department of psychiatry at the University of Michigan. Warren compares homesickness to losing a loved one, although what the person is grieving is the loss of the familiar place. It's associated with insomnia, problems with appetite, and difficulty concentrating.`

const t1819B = `Change in Activism

It has always been the youth who have promoted changes. From the Vietnam protests to Tiananmen Square, young people have been the catalyst for many moments of social change and expression of resistance. This moment in time is no different, with millennials and Generation Z transforming activism into a form appropriate for this new technological age.

The sharp increase in activism from young people is in direct correlation with the historic events that took place in 2016, that is, the Brexit vote in June and the US presidential election in November. These events triggered a powerful wave of activism, led by young people disillusioned with institutions and frustrated with the direction our society is moving in. A key moment of youth activism was March for Our Lives. This was an entirely student-led protest to demand gun control legislation in America. It finally resulted in the third largest march in US history.

In the UK, The Pink Protest was created to form a community of activists more accessible to young people. The Pink Protest's mission manifested in the #FreePeriods campaign of last year. The protest's aim was to provide young girls in need with free menstruation products like sanitary towels and tampons. As a result of the campaign, £1.5 million were given by the UK government to address this problem.

This new germination has created a wave of socially engaged young people, eager to use their social media presence for good. From #BlackLivesMatter to #LoveWins, social media has changed the meaning and the practice of activism. It is no longer needed to take to the streets to make an impact; it is now easier and more productive to reach greater numbers of people through a screen. Activism is no longer a scary or unattainable notion but a democratic concept where anyone can find their place.`

const t1920LA = `Lost and Found

Losing your wallet is a sure-fire way to ruin your own day. It starts with panic when you realize the loss, moves to a sinking feeling that your wallet is truly "missing in action", continues with monitoring your credit card transactions, and usually ends with calls to the powers that be at every credit card company, bank, and gym membership you had stored in your wallet, while you mourn the loss of your cash.

Tim Cameron was most likely working through those stages of grief on Monday when he realized that he had lost his wallet on the way home from his job in London. Luckily, though, a Good Samaritan had found the wallet and came up with an ingenious plan to get it back to its rightful owner. Like most people who lose a wallet, Cameron quickly checked his bank account to see if there was any unauthorized or strange activity. Turns out there was – but for a good cause.

Cameron noticed that there were a series of bank transfers all for just one pence and each came with a very small message. Someone had found his wallet, but since there wasn't enough identifying information to track down the owner, he had come up with a way to send his name and phone number through the bank deposit notes. Cameron explained in a tweet that each of the "4 transfers of £0.01" allowed for "a message of up to 18 characters", which is how the helpful stranger, known only as Simon, conveyed his contact information to Cameron. Cameron called the number, got Simon's address, and soon enough was reunited with his wallet, handing over a bottle of red wine as a thank-you gift.`

const t1920LB = `The Real History behind Game of Thrones

George R.R. Martin holds his cards close to his chest when it comes to his inspiration for Game of Thrones – after all, too much information could spoil the plot. But he has acknowledged that much of the political intriguing that drives his series is inspired by the Wars of the Roses, when the Houses of Lancaster and York engaged in a bloody fight for the English throne.

Other historical parallels have been drawn by fans of the books and the HBO series. When Edward IV died, his sons Edward V and Richard of Shrewsbury were mysteriously imprisoned in the tower of London, and eventually disappeared. Many suspect they were put to death by their uncle Richard III, who became king. Sound familiar? Many have compared the Princes in the Tower to the disappearance of Bran and Rickon; though in Game of Thrones, the boys actually escaped, and two corpses burned beyond recognition were presented as their substitutes.

Like Yara Greyjoy, Empress Matilda was meant to take the throne when her father died but was pushed out by a male relative. And like Cersei Lannister, Margaret of Anjou exerted outsized influence for a medieval queen consort and fought vigorously for her son's right to the throne.

The horrific Red Wedding has roots in the Massacre of Glencoe in 1692, when 38 members of the Clan MacDonald were killed by their own guests due to an unfulfilled promise of loyalty to the monarchs. Obviously, the killings constituted a serious transgression against the rules of hospitality. And the Wall along the northern border of the Seven Kingdoms bears a similarity to Hadrian's Wall, built along the northern border of Britannia to keep out the barbarians (the Scots).`

const t1920MA = `A New BBC Period Drama

The BBC is to make its first prime-time period drama that will have Asian actors in all the leading roles. Filming is due to start this summer on an adaptation of Vikram Seth's A Suitable Boy, which at 1,349 pages is one of the longest novels in the English language.

It will be directed by Mira Nair, the Indian-American film-maker behind Monsoon Wedding. Andrew Davies, best known for adapting Pride and Prejudice for the BBC, has been drafted in for the screenplay.

To be broadcast next year, the series is expected to have more than 100 characters. All the main roles will be played by Asians – many from India – while the handful of white characters in Seth's book will appear only as bit parts. It contrasts with ITV's current Sunday night offering, Beecham House, which stars Tom Bateman playing a former member of the East India Company in the leading role. Previous hit dramas set in Asia, such as The Far Pavillions and The Jewel in the Crown, have also focused on white characters.

Davies acknowledged it was a big departure for the BBC, but believes viewers will still tune in. "It is exciting," he said. "Not many of the leading players will be known to a British audience. But it is also like a Jane Austen novel in that it's got a lovely, easy-to-relate-to central plot."

A Suitable Boy revolves around the desire of a middle-class Indian mother, Rupa Mehra, to marry off her youngest daughter, Lata. The Indian actress Tabu, who starred as the mother in Ang Lee's Life of Pi, is expected to play Mehra, while a Bollywood star has been cast as Lata.`

const t1920MB = `The Carbon Footprint of your Inbox

Your annual work email could be adding the same amount of warming carbon dioxide to the atmosphere as a flight between London and Bruges. Email has a carbon footprint because of the power demands to create and run the computers, servers and routers that transmit each message.

The average email reportedly adds an extra 4 grams of carbon dioxide into the atmosphere – but this can increase 12 fold in email chains or with big attachments. Office workers on average process over 34,000 emails each year and can spend around 13 hours a week working on their inboxes. "This amount of carbon dioxide is equivalent to a customer having used 16,800 plastic bags in a single year," a spokesperson for CWJobs said.

Not every email is equal, however, as adding a single 1MB attachment is predicted to raise its carbon output up to 19 grams. Larger attachments use up more energy in turn. "A particularly long email chain produces more than just hot air – it can generate as much as 50 grams in CO2 emissions," CWJobs said. With global email traffic predicted to rise by 18 per cent in 2023, it would result in an extra 620 million tonnes of carbon dioxide each year.

A series of recommendations for how people can cut down on their communicative carbon footprints have also been published. These include only adding necessary people in email chains, replacing attachments with links to material online, and talking to people in person. In addition, due to the European Union's General Data Protection Regulation, the total number of unwanted emails have been reduced by 1.2 billion messages a day, which is the equivalent of 360 tonnes of carbon dioxide emissions cut every single day.`

const t2021LA = `Is the Full Stop no Longer Necessary?

The full stop has been used for centuries to end sentences, but its use is changing. As Generation Z – teenagers or those in their early twenties – have grown up in the age of instant messaging, the punctuation mark is no longer commonly used. Linguists from across the world have been investigating the purposefulness of the full stop as communication habits have evolved, and some of them think people simply do not put full stops in unless they want to make a point.

Dr Fonteyn tweeted: If you send a text message without a full stop, it's already obvious that you've concluded the message. "So, if you add that additional marker for completion, they will read something into it, and it tends to be a falling intonation or negative tone." The full stop is "intimidating" to young people who interpret it as a sign of anger.

According to The Telegraph, linguists are divided on whether the full stop has become redundant given that text messages are concluded by pressing "send" so there is arguably no need for the full stop. In 2015, a study from Binghamton University suggested that people who finish messages with full stops are perceived as insincere. The study involved 126 undergraduates and the researchers concluded that text messages ending in the most final of punctuation marks were perceived as being less sincere. Unusually, texts ending in an exclamation point are deemed heartfelt or more profound.

Research leader Celia Klin said: "When speaking, people easily convey social and emotional information with eye gaze, facial expressions, tone of voice and so on. People obviously can't use these mechanisms when they are texting. Thus, it makes sense that texters rely on what they have available to them – emoticons, deliberate misspellings that mimic speech sounds and, punctuation."`

const t2021LB = `Women Spies during World War II

The summer of 1941 was a difficult time for Britain and her European allies in the war. The Nazis were bombing key cities across the country and much of Europe had fallen to the Germans, leaving Britain vulnerable. This made the work of the Special Operations Executive (SOE), and the actions of women within it, that much more important.

Established in June 1940 in London, the SOE was a volunteer force set up to practice a secret war behind enemy lines. Intelligence agencies realized fairly early on during the war the important part women could play in spying, in what had been traditionally considered the domain of men. Women were thought to be more discreet as spies, and capitalized on this perception during the war, carrying out tasks and missions that men were unable to do. In the field, women could go unnoticed as messengers delivering vital information, with one SOE officer from Holland noting that in 1944, women were rarely stopped and searched at checkpoints.

In some instances, women spies took big risks and they had a great influence in the development of the war conflict. As historian Juliette Pattinson notes, "several wartime accounts indicate that male agents were less skilled and inventive than their female colleagues."

The SOE had sent 39 women to Occupied France by the time of the D-Day invasions on June 6, 1944. Because it was crucial that they evade suspicion, the SOE recruited agents who could speak French and adapt to French life. Each agent was given a codename or an alias, and trained in specialist skills, including radio operations, how to maintain a cover story and how to open locks.`

const t2021MA = `The Special Olympics

Over 50 years ago, Eunice Kennedy Shriver saw how unjustly people with intellectual disabilities were treated and that many children didn't even have a place to play. She decided to take action and held a summer day camp for young people with intellectual disabilities in her own backyard. In this camp, these young people could participate in sports and physical activities, focusing on what they could do, and not on what they couldn't do. This was a revolutionary idea at the time.

In 1968, 1,000 athletes with intellectual disabilities from the USA and Canada competed in the first Special Olympics International Summer Games in Chicago. There, over 200 events were offered – from 100-yard swim to high jump, water polo and floor hockey. The event was so successful that Eunice assured that more games would be held as a "Biennial International Special Olympics".

The event has grown to become an international competition. In 2003, for the first time, it went to another country, Ireland. Initially, the organisers didn't expect it, but nearly every country wanted to host the competing nations and their athletes. Ireland took the Olympic Games to its heart. There were around ten thousand volunteers and people came out in the hundreds of thousands to enjoy the spectacle and cheer on the athletes. Any barriers that had existed before between those with and without intellectual disabilities broke down then.

Sport brings people together. Nevertheless, it seldom brings out the levels of shared empathy and joy as the Special Olympics does, being a force for good, change, and unity. It has been celebrated every two years in seven different countries so far and is usually the largest sports and humanitarian event in the world that year.`

const t2021MB = `Students Vote and Work the Polls, Despite the Pandemic

Historically, most young Americans don't vote. In the 2016 presidential election, fewer than half of eligible voters between 18 and 29 cast a ballot. Last year, that changed. Young voters were showing rare levels of enthusiasm, even as college students faced new obstacles. "The pandemic upturned both how people vote and how students learn," said our colleague Dan Levin, who wrote about the struggles students face right now. "Just like there have been Zoom classes, students were going virtual with their organizing."

In a regular election year, campus activists would have tables on the quad and knock on doors in dormitories. Last year, instead of crowding into common rooms, students were hosting debate watch parties on Zoom, recruiting poll workers over Instagram and encouraging students to post their voting plans on Snapchat. "We had to exhaust every possible option to continue energizing voters," said Roderick Hart, 20, a junior at Morehouse College in Atlanta. "Social media was really our only way of connecting everybody at once, considering we weren't on campus."

Last year, more than seven million voters under 30 had already cast ballots, including nearly four million in 14 key battleground states, according to data compiled by researchers at Tufts University. "We just came in and got as many students as we could engage on their floor," said Jess Scott, who asked resident advisers at the University of Pittsburgh to host voter information sessions on Zoom. Students were disproportionately vulnerable. The coronavirus exacerbated concerns about student IDs and proof of residency, as documents moved online, and many students were learning in other places.`

const t2122LA = `Firms Hire for "Cultural Fit"

Job rejections are like break ups – they are never fun, but some are worse than others. 'We were impressed by your resume, but you're not a cultural fit' is the 'it's not you, it's me' of job rejections. It is vague, confusing and almost always means there was something about you personally they didn't like, but didn't want to say out loud. Sandra Okerulu experienced this first-hand earlier this year. She applied for a role at a New York-based company and had an interview which went "perfectly", she says. The company told her that her experience was what they were looking for, and she'd get an email about a second interview shortly. But she heard nothing for days. "Then I got an email saying I wasn't a good fit, so they went with somebody else," she says.

Of course, candidates understand job interviews are about more than checking qualifications. They're also compatibility assessments – if your working style and behaviours mean you'll function well within an organisation. The problem is that, too often, these assessments are subjective. That can mean candidates who look, act or sound different to recruiters are at an immediate disadvantage. Being dismissed for 'cultural fit' can leave demoralised candidates struggling to decipher what they did wrong. It can also leave certain workers unable to access particular roles or sectors.

Although many recruiters only hire candidates they think will fit with the company culture, research shows it's actually in companies' interests to stop doing this if they want to build better teams. In fact, there's a significant disadvantage for companies who rely on cultural fit: they can end up very homogenous, so diversity is actually better for business.`

const t2122LB = `Environmental Impact of the Clothing Industry

According to reports from 2019, the amount of clothes bought in the European Union (EU) per person has increased by 40% in just a few decades. This fact was driven by a fall in prices and the increased speed with which fashion is delivered to consumers.

Clothing accounts for between 2% and 10% of the environmental impact of EU consumption. This impact is often felt in third countries, as most production takes place out of the EU. The production of raw materials – e.g. pesticides for cotton –, spinning them into fibres, weaving fabrics and dyeing require enormous amounts of water and chemicals. Consumer use also has a large environmental footprint due to the water, energy and chemicals used in washing, tumble drying and ironing, as well as to microplastics shed into the environment.

Less than half of used clothes are collected for re-use or recycling when they are no longer needed, and only 1% are recycled into new clothes, since technologies that would enable recycling clothes into virgin fibres are only starting to emerge. Various ways to address these issues have been proposed, including developing new business models for clothing rental, designing products in a way that would make re-use and recycling easier (circular fashion), convincing consumers to buy fewer clothes of better quality (slow fashion), and generally directing consumer behaviour towards choosing more sustainable options.

In 2018, the EU adopted a circular economy package that will for the first time ensure that textiles are collected separately in all Member States by 2025 at the latest. The European Parliament has for years promoted the use of ecological and sustainable raw materials and the re-use and recycling of clothing.`

const t2122MA = `Today's "Fake News" Used to Be Called Yellow Journalism

It is perhaps not so surprising to hear that the problem of "fake news" — media outlets adopting sensationalism to the point of fantasy — is nothing new. As Robert Darnton said, the first example of this in history may have been in the late 19th century. This was when "Yellow Journalism" first began.

Why yellow? The reasons are not totally clear and some sources point to the yellow ink the publications would sometimes use, though others say it was named after a popular cartoon called The Yellow Kid. This cartoon first ran in Joseph Pulitzer's New York World, and later William Randolph Hearst's New York Journal. These two newspapers were in a battle because they wanted to win readers. Their competition led to the rise of Yellow Journalism.

Although today his name is somewhat synonymous with journalism of the highest standards, through association with the Pulitzer Prize, Joseph Pulitzer had a very different reputation while alive. After purchasing The New York World in 1884 and rapidly increasing circulation through the publication of sensationalist stories, he earned the dubious honour of being the pioneer of tabloid journalism. He soon had a competitor in the field when his rival William Randolph Hearst acquired The New York Journal in 1885. The rivalry was fierce, each trying to outdo each other with ever more sensational and scandalous stories.

Yellow Journalism was at its worst in the days leading up to the Spanish-American War. Hearst's newspaper had a major influence on the conflict. It encouraged anti-Spanish feelings across the United States. Some people started calling the war "The Journal's War". Both newspapers published stories about the war that were full of unconfirmed claims, sensationalist propaganda, and outright factual errors.`

const t2122MB = `Breakfast Radio

Global Breakfast Radio (GBR) is a 24-hour operation, broadcasting programs from more than 250 radio stations around the world. But there's a catch: each of those stations is only played during its time zone's respective breakfast time slot. As GBR explains in a statement, "The sun is always rising somewhere; breakfast is always just about to happen. In some small way, Global Breakfast Radio hopes to be a way of traveling globally through the medium of radio."

The station was created by two UK-based breakfast radio fans, Seb Emina, a writer, and Daniel Jones, a systems artist. The duo searched for hundreds of radio stations worldwide to narrow down the current list of 250. Those stations play on a loop, with music and news following the sunrise. Pulling that off, however, required a bit of technical finesse. Digital music lovers might notice that the output bears a little resemblance to the algorithmically generated playlists built by Spotify or Pandora. "The difference is that here the algorithm is mediated by the day-long cycle of the Sun sweeping the globe," says Jones, "tied together with the myriad broadcasters in these remote locations."

But this is not without problems, explains Jones. "We soon discovered that internet stream URLs seem to decay and disappear extremely quickly, meaning that the database of stations needs to be constantly updated." Once the algorithmic problems were worked out, the team tried to create a list that is representative of the tremendous diversity around the globe and that captures the feeling of exploring new places. Even licensed photos of sunrises from those places are shown as music and news are broadcast.`

const t2223LA = `Who Invented Music?

No historical evidence exists to tell us exactly who sang the first song, or whistled the first tune, or made the first rhythmic sounds that resembled what we know today as music. But researchers know it happened thousands of years ago. The earliest civilizations throughout Africa, Europe and Asia had music. Back then, many believed it was a divine creation, a gift from the gods.

Some scholars say singing was the first kind of musical sound. Not that people back then were humming full songs. Instead, they made simpler vocal sounds – perhaps just a few notes combined. If that's true, perhaps early humans began to speak and sing at about the same time. Why did they sing? Maybe they had an impulse to imitate something beautiful, like bird sounds. Vocal imitations of other animal sounds, however, may have been used for hunting, like a modern-day duck call. It's also possible singing was a way to communicate with infants and toddlers, like early versions of lullabies. But again, people were not singing melodies or songs; our modern lullabies evolved throughout centuries.

Archaeologists have helped musicologists to learn about ancient musical instruments from the artifacts they've uncovered. For example, they have found flutes and whistles made of bone, pottery and stone. When the scientists measured how much carbon-14 was left in the flutes – which were made from the bones of large birds – they discovered some of the instruments were more than 30,000 years old! Musical instruments could also be associated with different types of people. Farmers played the syrinx, a small instrument that was easy to take into the fields. The aulos was a more sophisticated wind instrument: typically preferred by poet-musicians, it took more skill to play it.`

const t2223LB = `How Global Warming is Cutting Sleep Across the World

Humans spend about a third of their lives asleep, yet a growing number of people do not sleep enough. When adults do not receive the recommended amount of sleep, they may have issues with concentration. Long-term effects can include an increased risk of some health concerns like cardiovascular and gastrointestinal diseases. Global warming does not help.

People worldwide are likely to lose 50 to 58 hours of sleep a year by 2099 due to the climate crises, a new study revealed. Researchers used wristbands with internal accelerometers to measure sleep duration in over 47,000 adults across 68 countries for an average of six months. A single night over 30 degrees Celsius reduces sleep time by about a quarter hour per person. Based on the research, the elderly lost twice the amount of sleep per degree of warming compared with young or middle-aged adults. Women were also about 25% more affected by the rising temperatures than men.

The amount of sleep people received during the first month of summer, when people were less familiar with the heat, and the last month of summer was very similar. This similarity in sleep loss indicated that people cannot adapt to higher temperatures over time. Additionally, results showed that people did not appear to recover the sleep they lost during a warm night in the two weeks after a temperature spike.

Air conditioning may allow people to adapt to the warmer temperatures, but it's not a reliable, long-term solution. People living in lower-income countries have less access to air conditioning, which could further the equality divide. In addition, air conditioners release greenhouse gas emissions, which naturally increase global warming.`

const t2223MA = `Theatre Audience Etiquette

Face masks, proof of vaccine and strict seating assignments might not sound like your ideal night out at the theatre. But while many of these rules may appear unprecedented in British performance venues, COVID-19 protocols can be connected to a long history of regulating audience behaviours in theatres. In the approximately 2,500 years of theatre history, rules and expectations of theatre audiences have reflected the ways that societies negotiate social norms. Spectators' conduct has frequently raised questions about how they should behave and who should oversee that behaviour.

Audiences in the theatre of ancient Greece were active participants in the many dramatic festivals. Aristotle describes an angry audience shutting down a performance after they perceived inconsistency in the show. Alongside this lively conduct was also an impulse to regulate audience behaviour: a kind of "theatre police" was tasked with maintaining order during performances.

Sixteenth-century England was renowned for its noisy audiences who, in public outdoor theatres, could sleep, eat and drink heartily all while taking in Shakespeare's newest work. And in the mid-18th century, celebrated theatre manager David Garrick renovated his theatre to move the spectators off stage (up to that point audience members could actually sit on stage alongside the performers) and prevent them from entering the theatre via the actors' dressing rooms.

Nowadays, the notion of proper etiquette at the theatre persists, although the audience is more docile. Audience etiquette guides, which cover everything from dress code and late arrivals to coughing and unwrapping candies, are widely available today. Cell phone use has also become a particularly controversial issue, sometimes policed by the actors themselves: in 2015, American actress Patti Lupone stopped a New York City performance by physically confiscating an audience member's phone because it was ringing.`

const t2223MB = `The Risks of Ultra-processed Foods

In many households, ultra-processed foods are popular options at the kitchen table, including unhealthy products that you may not even think of as junk food such as snack bars and sweetened yogurts. Breakfast cereals, soft drinks and energy drinks count, too.

Every year, food companies introduce thousands of new ultra-processed foods with an endless variety of flavours and ingredients. They are what scientists call hyper-palatable: easy to overeat, and capable of controlling the brain's reward system and provoking powerful desires. Some experts argue that ultra-processed foods are so appealing to us not only because they taste really good, but also because they contain potent combinations of fat, sugar, sodium and artificial flavours.

Ultra-processed foods represent a larger share of the world's diet in relation to earlier decades. Almost 60 percent of the calories that adults in America eat are from these foods. They account for 25 to 50 percent of the calories consumed in many other countries. Yet in dozens of studies, scientists have found that ultra-processed foods are linked to higher rates of obesity, heart disease, hypertension, and colon cancer. In 2021, a study found that people who ate a lot of ultra-processed foods had a 19 percent higher likelihood of early death from cancer and a 32 percent higher risk of dying young from a heart attack, compared with people who ate few ultra-processed foods.

Research also shows that our bodies seem to react differently to ultra-processed foods compared with similar foods that are not so highly processed. For example, on a diet of ultra-processed foods, people quickly gain weight and body fat. However, on an unprocessed, homemade diet, the reverse happens: people lose weight, and they have reductions in cholesterol and an increase in their levels of an appetite-suppressing hormone.`

const t2324LA = `How a Child Lives the Present

I took my two-year-old grandson, Jason, to the park where he could run around and see the duck pond. My goal was to get him outside for a while and teach him about the ducks. They're actually geese, but duck pond sounds cuter, so that's what we call it. Some neighbors have seen frogs in it, and even snails! Swans settled in the pond some time ago. Many ducks too, but one day the ducks flew away and never returned.

Two-year-olds don't need goals. That was the first of several lessons I learned that day. Jason had a sense of wonder. As soon as we got out of the car, he looked up at the sky. He found joy in watching the big, pillowy clouds drifting across the sky. I'd forgotten how hypnotic clouds could be. Next, he stared at the oaks and the willows and watched their leaves rustle in the wind.

His curiosity was constant, intense. He was always on the search for sticks, big and small. A stick could be used for many things. He scraped the ground with them or waved them in the air like a flag. Jason said hi to everyone. A few 4- and 5-year-olds weren't sure how to respond. But they all said hi back. His emerging language skills are typical for his age, part vocabulary and part babble. He tried to start conversations with more enthusiasm than success. It was clear he didn't care what people looked like, how old they were, or whether they said hello first.

My biggest revelation was that Jason was fully present no matter what he was doing — looking for sticks, running across the lawn, or looking at the sky. He was completely and absolutely in the moment.`

const t2324LB = `Is Artificial Intelligence Transforming Education?

As one of the most disruptive technologies in the forthcoming years, even in schools, Artificial Intelligence will be able to make the educational experience more efficient and engaging, both for teachers and students. Last year, Stanford University published the report "Artificial Intelligence and Life in 2030," exploring the role of AI in various aspects of society. Talking about education and learning, the report stated that AI will play a fundamental role.

Formal education will probably never disappear completely, but it is clear that the new forms of online education are becoming more and more important. "They will become part of learning at all levels, from K-12 to University," says the report by Stanford University, "facilitating more customisable approaches to learning." Thanks to the Artificial Intelligence, in fact, online education systems will learn as the students learn, understanding their needs and supporting them with a tailor-made itinerary.

Also, statistics about learning will accelerate the development of new tools for personalised education. With the use of technologies powered by Artificial Intelligence, the problem of a "one-size-fits-all" approach to teaching will be finally solved. Thanks to Machine Learning algorithms, teachers will be able to identify the educational needs of their students, and find the gaps in their methods, pointing where students are struggling the most. On the other hand, students will be able to move through their education more effectively, and talented students who are often bored by easy tasks will finally find new motivation and challenges.

In years to come, teaching will remain a complex social interaction that requires authentic human skills, such as empathy for example, and these skills could hardly be learned by a machine. This means instructors will simply be assisted by robots, which will make these professionals better at their job.`

const t2324MA = `Women Engineers

Gladys West is a mathematician whose work helped with the development of the Global Positioning System (GPS). A black woman born in rural America under racial segregation, her work has transformed our everyday lives. Her excellent performance at high school granted her a scholarship for university. She became the second black woman programmer to work at a naval base. Gladys programmed a computer to produce an accurate model of the shape of the Earth, tides, gravitation, and other forces and this model became the basis for GPS.

Marian Croak is a pioneer in telecommunications engineering, who has over 200 patents. She is known for the invention of VoIP (voice over Internet protocol), the technology which permits real-time audio and video calls over the Internet. Marian was born in the USA. As a child, her father built a chemistry set for her, and this is what inspired her to follow a career in STEM (science, technology, engineering, and maths). VoIP allows us to video chat, to have economical phone calls with loved ones around the world, and work remotely. She is a supporter for racial justice and women in engineering.

Larissa Suzuki is a computer scientist and engineer who works in the field of AI (artificial intelligence). She works at Google exploring how AI can solve real-world problems, and collaborates with NASA. She was fascinated with electronics, and imagined ways of making static things walk and dance. Toys like Lego allowed her to be creative and explore building structures. She has developed systems for smart cities, robots, healthcare, and finance. Larissa has autism and hyperactivity disorder. She has been dedicated to equality and diversity in engineering.

These women have overcome various obstacles due to their personal struggles and have had tremendous impact. Today women continue to pave the way for future generations.`

const t2324MB = `Does Chicken Soup Really Help when You're Sick?

For centuries, people all around the world have been making chicken soup when someone is sick and it's a tradition that has been passed down through generations. But here's a good question about it: Does chicken soup actually have any science-based benefits, or is it just a comforting remedy that makes us feel better when we're feeling unwell, even if it doesn't have any true medical benefits?

Even when we are not sick, the popularity of chicken soup is huge. The reason behind its success is its warmth and the delicious flavors it contains, such as those from the chicken, vegetables, and noodles. The unique taste of chicken soup is often described as umami (in Japanese), which is a savory taste. It is considered the fifth category of taste, alongside sweet, salty, sour, and bitter.

Studies have shown that the taste of chicken soup plays a significant role in its healing properties. When people are suffering from respiratory illnesses, they often lose their appetite gradually and eat less. This happens because respiratory illnesses cause an inflammatory response in your throat, so swallowing becomes painful. Not eating enough can lead to a lack of necessary nutrition, which isn't ideal for recovering from illness.

To sum up, while the idea of chicken soup as a remedy for illness might have its roots in comfort, there is indeed some science behind its potential benefits. In particular, it has been proved that its taste stimulates our appetite when we are sick.`

const t2425A = `The Magic of Train Travel

Planes are faster and cars more convenient, but neither captures the spirit of travel quite like an adventure by rail. The love of railways has very deep roots, which have been sustained by the tales of train travel in literature and the arts.

Before the invention of railways, carriages pulled by horses took days to cross a country and passengers were at constant risk of injury or death, as accidents were frequent. The railways transformed all this. Train travel changed even the way people interacted. Rather than having to marry one of the girls or boys in the village, people were able to travel to the nearest town or city, where the opportunities for romance were far greater. Soon, the railways created possibilities that were unimaginable before. And soon, the journey became part of the fun. As facilities such as dining cars and softer seats — not to mention toilets — began to be introduced on trains, the journey also became something exciting, a part of the holiday.

Part of the pleasure of railway travel is its perfect pace. The right train journey is just fast enough to avoid the boredom of a car or bus trip. Besides, it is not so rapid, like air travel, as to get rid of the need for adaptation from the familiar location to a new one. Ideally, there will be a few stops long enough to buy food off the station kiosks and pick up a newspaper to be read back on the train. Trains provide a constantly changing vision of the world, an ever-running film through the window.

The renaissance of long-distance rail travel can be seen as a reaction to the arrival of high-speed trains, which remove some of the traditional enjoyment of rail travel. They are too functional, with service that often mirrors the worst aspects of air travel — such as security checks at stations — and their speed removes part of the pleasure of watching the world go by slowly enough to enjoy imagining who lives in that little cottage, or why those cows are all grouped together at the far end of that field.

What is it then about trains? In truth, it would not have been surprising if they had gone the way of the horse and cart. The railways were a nineteenth-century invention that were lucky to survive the twentieth, given the convenience of cars. But here we are, well into the twenty-first century dreaming of the magic of our next charming train journey.`

const t2425B = `Home Education: the Right Choice?

There has been a notable rise in parents choosing to home educate their children over recent years, particularly since the COVID pandemic. However, the exact number of families home educating is not known and there is no legal requirement to register with a local authority in countries like England.

How and why do families choose home education instead of the traditional system? There are several options available to families when following an educational pathway for their children. If a child is already at conventional school when their family decides to home educate, the parents must cancel their child's registration before beginning home education, sending a letter to the school. However, if a child is not at school and has not been entered into the schooling system, there is no requirement to alert the local authority, and parents can simply continue to educate their kids as they prefer. Some parents may go for a combination of school and home education. This is known as flexi-schooling: the child attends school part time and learns at home part time. However, this is not a right and it requires the agreement of the school's headteacher.

There are many reasons why parents choose to educate their child at home. There are those who reject the typical way of educating and opt for a more "unconventional" approach. The parents want to focus on nurturing their children and want to be at home learning with them. Some families prefer to home educate so they can teach the curriculum they wish and give their children a personalised education. Their child might have special educational needs or disabilities that their school is unable to meet adequately, or they might be being bullied at school, or be highly gifted, meaning that they or their parents feel the school curriculum isn't suitable for them.

Social media — where parents discuss the challenges their children face in mainstream education — has played a powerful role in expanding knowledge of home education. More parents may be making this choice because they know it is an option available to them. The challenge is to ensure that adequate support is in place for the children who may want to remain in school but feel they cannot, as well as for those whose families wish to home educate.`

const t1718ModA = `Selfie Accidents

Tourists and camera lovers should remember a new danger that has recently appeared. This new life-threatening hazard started in the last few years and is now everywhere. It is almost twice as deadly as being killed by a shark.

What is this new danger? Well, it is the selfie. The desire to take a photo of yourself in front of a world-famous site or to pose with a friend resulted in more deaths in 2015 than those due to lightning strikes. More and more people are putting themselves into dangerous situations in a bid to take the most outrageous pictures in order to get more likes and shares on social media. In particular, pictures with animals, or taken at great heights, or posing with weapons are widespread.

Selfie accidents happen in many ways. They include two Russian men who were killed while taking a selfie with a hand grenade, three Indian students who were killed by a train while taking selfies on train tracks, and a 32-year-old woman who was attacked by a bear in a national park after turning her back on the animal to take a picture with herself in the frame. The latest death came when a Japanese tourist died falling down the stairs at the Taj Mahal in India while trying to snap a selfie.

There is, however, some evidence that there may be other selfie-related deaths that we don't know about because they didn't make international headlines. In July, Russian authorities issued a selfie safety campaign after "hundreds" more injuries were reported. The interior ministry's initiative included a leaflet, a video and a website.`

const t1718ModB = `The Legend of the Bermuda Triangle

The Bermuda Triangle is a mythical section of the Atlantic Ocean where dozens of ships and airplanes have disappeared without explanation. Indeed, this region of the sea certainly has had its share of marine tragedy. Unexplained circumstances surround some of these accidents, including one in which the pilots of a squadron became disoriented while flying over the area; the planes were never found. Nevertheless, other boats and planes have vanished from the area in good weather without even radioing distress messages.

The first report about the mysterious Bermuda Triangle has been assigned to Christopher Columbus when, in 1492, he sailed through the area on his first voyage to the New World. He wrote in his journals that, inside the triangle, the ship's compass stopped working and he saw a fireball in the sky. Other reported compass issues in the region followed, giving rise to the myth. In addition, the weather in this region can also make traveling hazardous. The summer brings hurricanes while the warm waters of the Gulf Stream promote sudden storms enhancing the mysterious aura.

Researchers have attempted to determine the cause of these plane and boat disappearances proposing innumerable theories regarding the Bermuda Triangle. However, none of them prove that mysterious disappearances occur more frequently there than in other well-traveled sections of the ocean. In fact, people navigate the area every day without incident. As a matter of fact, in spite of the navigational challenges this area poses, insurance companies do not consider it as an especially hazardous place.`

const t1718ExtA = `Saving the British Pub

In 1946 George Orwell described his favourite pub, "The Moon under Water", where there were "mirrors behind the bar" and a "ceiling stained dark yellow by tobacco smoke". It was the perfect pub, but it didn't exist since the ideal boozer lived only in Orwell's imagination. If we carry on the way we are, by 2046 many of the real pubs will exist only in our imaginations, too.

Today about 17,000 pubs are expected to be affected by a dramatic raise in business rates, with closures feared in the next five years. Yes, the death of the great British pub has long been predicted, with some losses since the 1900s. However, in the past decade numbers have dropped like a stone. What is strangling "The King's Head"? The smoking ban, wage stagnation, alcohol duty, supermarket pricing and the more nebulous "cultural change". In the forties Orwell wrote that the trend was "away from creative communal amusements and towards solitary mechanical ones" - and this was half a century before the Internet and Netflix came to seduce us.

There are many good economic arguments for wanting to see pubs thrive. In fact, a recent report showed that the industry supports 900,000 jobs. But this is not why the thought of decline hurts. It hurts because for many British people pubs are, in a strange way, an extension of what home is. Our national identity is glued by the places we share, the common denominators of the British experience - and there is perhaps no greater one of these than the pub.

More should be done especially to help rural pubs provide different services and stay alive. One organization helps landlords set up post offices, shops and libraries. We should take more pride in our pubs and support them.`

const t1718ExtB = `Fancy a Lab Grown Burger?

Tissue engineering, which helps to improve damaged cells or whole organs, has proved to be extremely useful for medical applications that extend our lives. However, we might question ourselves what's the point of living with artificial organs for a much longer period and without disease if our planet is going to be barren and without food. The answer might be cultured meat, that is to say, meat produced in a laboratory, in a cell culture, rather than from an animal, but identical to the burgers you can find at any supermarket. This new type of meat has the potential to address huge global problems such as world hunger and global warming in the coming years. After all, if you look at the potential benefits of tissue engineering, food production for 9 billion people is going to be a much more relevant matter than merely prolonging their lives.

After producing the first cow-less burger, which cost a massive €250,000 to grow, a researcher at the University of Maastricht has become the public face of cultured meat. That first burger, which was financed by a co-founder of Google, was tasted live in London back in 2013. The price has since dropped to around €10 per burger, and several new companies in the US and in Israel are currently working on their own cultured meat products. In 3-4 years' time these companies might have launched some expensive burgers in small scale production. However, large-scale production with a price equal to regular meat will take much longer.

Lab grown meat is not only beneficial for humans. Animal welfare is an added benefit; however, if one had to prioritize, no doubt the environmental impact of protein production alternatives for beef and pork is even more important. More cultured meat means less pollution through fossil fuel usage, animal methane, effluent waste, and water and land consumption.`

const t1819ModA = `Parents Join Facebook to Spy

Parents admit using Facebook to spy on their children, according to a survey. Logging in at least once a day on average, parents use the site to find out where their children have been, check who they are friends with, and get updates on their private life via their "relationship status".

According to a survey of 1,000 parents of children aged 13 to 30, mothers were the most guilty of Facebook spying. They were 14 per cent more likely to be keeping tabs on their child's profile than fathers. Clare, a mother of three, said she used Facebook to "spy" on her daughter, adding: "I sometimes get concerned when I see pictures of her out clubbing as I know she'll be drinking and worry about her safety".

Overall, two in three parents admitted to using the site to spy on their children, doing so for an average of 18 hours per week. One in six of those who joined Facebook confessed that spying on their children had been their sole motivation of doing so. Eleven per cent of respondents justified their snooping by insisting it was the only way they had to find out if their child had a partner. However, only two per cent said that they use the site to keep an eye on their child's spending.

The survey director said: "Naturally parents will worry about their child and Facebook helps them keep track of what they are up to. Facebook allows users to share everything, meaning parents can see who their kids are hanging out with and what they're spending their money on".`

const t1819ModB = `The Dangers of Perfume

Recently, in some towns in North America, people who claim they are sensitive to scent have demanded the prohibition of toxic perfume in the workplace, hospitals, classrooms, and other public places. Amazingly, despite the protests made by perfume lovers, many of these bans have been approved.

The reason behind this is the controversial claim that many people make to having Multiple Chemical Sensitivity (MCS), a disorder that gives headaches, watery eyes, nausea and breathing difficulties when sufferers are near any kind of chemical: cleaning products, air fresheners and, yes, perfumes. Doctors claim MCS isn't a real syndrome; sufferers insist it is. There may be at least some truth to their claims – after all, we all have an "enemy" scent that makes us feel nauseous, and many people do complain of headaches after spending too long at the perfume counter in department stores.

So the question is: how can we smell delightful, whilst not making ourselves and others feel ill? A number of experts say that a good solution is to choose natural perfumes such as almond or lavender. These are far less likely to cause allergic reactions or damage your health, but are a bit more costly, since natural oils are more expensive than man-made chemicals. Still it is well worth it – you are paying for quality ingredients rather than advertising campaigns, which is the main expense behind the price of most commercial scents. Recently, the number of companies specialised in natural perfumes is increasing; with more complex scents on offer, a healthier lifestyle has never smelled so sweet.`

const t1819ExtA = `Vampire Child

Archaeologists have discovered the body of a 10-year-old child at an ancient Roman site which provides evidence of ancient "vampire burials". A rock was inserted into the mouth of the child as part of a funeral ritual to prevent the deceased child from rising from the grave and spreading malaria, researchers believe. The unusual so-called "vampire burial" was described as "extremely mysterious" by the American archeologists who have been excavating the site in Teverina since 1987.

The find was unearthed at La Necropoli dei Bambini, an Italian cemetery that dates back to a malaria outbreak in 400 AD which killed many vulnerable babies and small children in the area. Previous excavations at this site have revealed the bones of infants and toddlers. There were also objects associated with witchcraft and magic, including raven talons, toad bones, bronze cauldrons filled with ash and the remains of puppies that appear to have been sacrificed.

Researchers had previously believed that the cemetery was designated exclusively for babies, toddlers and unborn fetuses, since the eldest body found had been a three-year-old girl. However, the discovery of the 10-year-old, whose age could be measured from dental development but whose sex is unknown, suggests that it may have been a burial location for older children as well.

Excavation director said: "Given the age of this child and its unique deposition, with the rock placed within his or her mouth, it represents an anomaly within an already abnormal cemetery." "There are still sections of the cemetery that we haven't excavated yet, so we don't know if we'll find other older kids," said Mr Wilson, a doctoral student in anthropology at the University of Arizona.`

const t1819ExtB = `Quiz for divorce in China

In some parts of China, married couples trying to split up have been asked to take a quiz distributed by the local authorities. The more they knew about each other, including a spouse's birthday or favorite food, the less likely they were to have their divorce immediately approved.

The quizzes, issued in at least two provinces since last year, follow the format of a typical three-part school exam. First, there are some fill-in-the-blank questions. Then, short answer questions and, finally, an essay. The topics of the questions are really varied from the mundane "when is your anniversary?" to the philosophical "have you satisfied your responsibility to your family?"

The quizzes contain 15 questions, scored on a scale of 100 points. Liu Chunling, an official in Lianyungang told the Yangtse Late News that they were developed as a way to prevent "impulse divorces". Local news agencies reported that the authorities considered a score of 60 points or higher to mean "room for recovery", and those couples were encouraged to work on their marriages.

The divorce rate in China is rapidly rising, pushed mainly by working women who feel newly empowered to get one. But the government is trying to slow the trend, which it sees as a cause of social instability. The state's focus on preventing divorce, experts said, stems from a Confucian belief that a stable society is made up of complete families. "Only through thousands of harmonious family units can an entire society achieve harmony," said Mr. Liu, the Lianyungang official.

The Chinese government had previously regulated other many aspects of private family life, including religion and pregnancy. In this case, the authorities claim, the main objective is only to let the couple consider this rationally and to treat it seriously.`

const t1920ModA = `Anne Morrow Lindbergh

Anne Spencer Morrow Lindbergh, American writer and aviator (1906-2001), was perhaps best known as the wife of Charles Lindbergh, the pilot who had made the first solo transatlantic flight in 1927. In her own right, however, she was a renowned pilot and the author of a number of popular books of fiction, diaries, and poetry.

Anne met her husband when he was her family's guest during the Christmas 1927 season. She graduated from Smith College, Northampton, Massachusetts, in 1928, and the couple was married the following year. Anne took up flying herself and in 1930 became the first woman in the U.S. to be granted a glider pilot's license. She became her husband's co-pilot, navigator, and radio operator and in 1930 helped him set a new transcontinental speed record of 14 hours 45 minutes from Los Angeles to New York City. In 1931 they made a three-month-long journey to survey air routes over Canada and Alaska to East Asia, and that trip later became the subject of Anne's first book, North to the Orient (1935), which was an instant success. She solidified her reputation with her second book, Listen! The Wind (1938), which recounted a 1933-34 survey of transatlantic air routes.

She went on to write more than two dozen works of prose and poetry, including five volumes of her own diaries. With Gift from the Sea, published in 1955, Anne became a heroine to millions of readers, especially women, for her thoughtful and lyrical meditation on the lives of women in the twentieth century. The book remained on the nonfiction bestseller list of The New York Times for a formidable 80 weeks, and sold five million copies in hardcover and paperback during its first 20 years in print.`

const t1920ModB = `Horse against Owner

An eight-year-old horse was found neglected and rescued in March last year. Named Justice by his rescuers, the stallion was found suffering from a skin infection, afflicted with lice, and 300 pounds underweight. He was removed from the property and taken to an animal shelter for abused, neglected and abandoned horses. After months of love and care, Justice started to improve. However, because of his injuries he will need constant ongoing medical attention and special care.

The heartbreaking story of Justice inspired attorneys at a leading legal firm that represents animals and their rights to try and change the law. They have decided to take legal action and, if they are successful, other animals that are abused and neglected could take their alleged abusers to court. The Executive Director of this firm states, "Oregon law already recognizes Justice's right to be free from cruelty – this lawsuit simply expands the remedies available when abusers violate animals' legal rights." In fact, Justice, represented in the case by these lawyers, is suing his former owner for \\$100,000. The aim is to cover the expensive costs of his ongoing and future medical care.

The former owner had pleaded guilty to criminal animal neglect last summer and was sentenced to three years of probation, preventing her from owning any pets or livestock for five years. But she refused to pay for Justice's future care. This is the first ever lawsuit of an animal suing its previous abusive owner. Animals are usually seen as property by the court but this case is looking to change that. One of the lawyers representing Justice in the case is confident the lawsuit will be successful. If so, animals will finally be seen as emotional living creatures that have rights, not as property.`

const t1920ExtA = `University Education

It used to be that a university degree was a fast track to a good career. But today, thousands of British students are instead having to struggle to find work to match their qualifications. The Office for National Statistics reported this year that almost one in every three graduates is overqualified for their job. Some students have taken their universities to court for failing to provide value for money and received thousands of pounds in settlements.

So which degrees should British students avoid if they want to become high earners? As regards men, a creative arts degree leads to the lowest average graduate salary. Men studying English or philosophy may also earn less than the average man who left school at the age of 16. As for women, in almost all cases doing any degree means a woman will earn at least slightly more than if she had not attended university. This is so because the earnings of women without university qualifications are much lower than those of men. Even those females studying social care, the degree with the lowest average earnings, enjoy a slightly higher salary post-graduation than women without a degree.

So, is doing a degree still really worth it? Yes, research does conclude that completing a degree is still worthwhile. "If a higher salary is the key reason for going to university, students need to choose their subjects carefully," said an investment expert. "For women, studying medicine or economics increases their earning potential by more than 60% and for men over 20%."

However, a high salary post-graduation is not the only motivating factor for young people choosing to continue their studies. "There are plenty of artists and philosophers who were enormously enriched by their university experiences – just not financially," Ms Coles added.`

const t1920ExtB = `The Ladies Bridge

Waterloo Bridge in London is nicknamed 'The Ladies Bridge' for the women who built it. As World War II overtook Europe and men went off to battle, the women of England entered the wartime workforce. "Before long," says the BBC, "women made up one third of the total workforce in the metal and chemical industries, as well as in ship-building and vehicle manufacture." They also worked on English infrastructure.

But while Rosie the Riveter, the star of a campaign aimed at recruiting female workers for defence industries during World War II, became perhaps the most iconic image of American working women, those who built this bridge were largely forgotten. "Today the riverboat pilots on the Thames tell the story of Waterloo Bridge being built by women in World War II," says the summary of The Ladies Bridge, a documentary by filmmaker Karen Livesey. Though a crew of largely women workers built the current Waterloo Bridge in the early 1940s, at the official opening of the bridge in 1945, Herbert Morrison, an English politician, thanked all the men who worked on the project: "The men who built Waterloo Bridge are fortunate men. They know that, although their names may be forgotten, their work will be a pride and use to London for many generations to come."

The displacement of women's role in the history of the Waterloo Bridge, says a 2006 article, wasn't out of malice, or discrimination. Peter Mandell, the head of Peter Lind and Company, the contractor that oversaw the building of the bridge in 1940s, said "there's no hidden agenda behind their unacknowledged achievements – the archive was simply lost when Lind temporarily suspended trading in the 1970s." "We're very proud of our female workforce," he says. "We're rebuilding this archive and want to honor them with a plaque on the bridge."`

const t1920ExtCoinA = `China Sets Rules for Young Gamers

The Chinese government has released new rules aimed at limiting video game addiction among young people, a problem that top officials believe is to blame for a rise in myopia and poor academic performance. The regulations, announced by the National Press and Publication Administration, ban users younger than 18 from playing games between 10 p.m. and 8 a.m. They are not permitted to play more than 90 minutes on weekdays and three hours on weekends and holidays.

The limits are the government's latest attempt to control China's online gaming industry, one of the world's largest, which generates more than \\$33 billion in annual revenue and draws hundreds of millions of users. Under President Xi Jinping, officials in China have taken a more forceful approach in regulating large technology companies and pushing them to help spread cultural values.

The National Press said that minors would be required to use real names and identification numbers when they logged on to play. The rules also limit how much young people can spend on purchases made through apps, like virtual weapons, clothes and pets. Those purchases are now capped at \\$28 to \\$57 a month, depending on age. Chinese officials said the regulations were meant to combat addiction. "These problems also affect the mental health of minors, as well as their normal learning and living," the National Press and Publication Administration said. Many of the biggest technology companies, including Tencent and Netease, have already imposed limits on younger users.

The rules were greeted skeptically by some parents and gamers. The owner of an industrial technology firm in China said he was worried that many children would still find ways to play video games. For example, he noted that his 7-year-old nephew often played games that did not require an Internet connection and were therefore difficult to regulate.`

const t1920ExtCoinB = `Ending the Age of Plastic

Christine Figgener, a marine biologist, could never have predicted that an eight-minute video would change the course of her career. But in August 2015, the 34-year-old marine-conservation biologist discovered a sea turtle in Costa Rica with a plastic straw lodged up its nose. Outraged at the extreme discomfort to the creature, Figgener filmed her research crew removing the straw from the turtle's nose, blood flowing from its nostrils. The heart-wrenching video has racked up more than 32 million views on YouTube. "I thought I can really show what kind of harm one object can do," she says.

Americans alone use as many as 390 million plastic straws a day — just a small proportion of the 8 million metric tons of plastic that ends up in the ocean annually. Though Figgener's video is three years old, it continues to make waves. In July it was credited with helping galvanize broader support for moves by major companies in phasing out plastic straws. "We can all do something," Figgener says.

Figgener worked in Costa Rica for several years before beginning her PhD at Texas A&M University. Now, alongside finishing her dissertation, Figgener spends her time visiting schools to educate the younger generations about the ocean and working with a group of girls in Indiana to eliminate disposable plastic utensils from their cafeteria. "This is exactly what we need — people that want to do something," she says.

She also takes part in a pen-pal program that she hopes paints a different picture of what it means to be a scientist. "A lot of people still have in mind that a scientist needs to be a white male," Figgener says. "I want to give children the idea that they can be a scientist, too, no matter who they are."`

const t1920OrdAdicA = `Emojis and Food Allergies

Someday soon an emoji might literally save lives. Hiroyuki Komatsu, a Google engineer, submitted a proposal to add a range of new icons to the standard emoji library that could help those with food allergies understand what they are eating anywhere in the world. "Emoji should cover characters representing major food allergens," Komatsu wrote in his proposal. "It enables people to understand what ingredients are used in foods even in foreign countries and safely select meals."

The reason that emojis are so universal is because they are chosen and developed by the Unicode Consortium, a non-profit corporation that oversees, develops and maintains how text is represented in all software products and standards. It is thanks to the Unicode Standard that when you text a friend six pizza emojis, they will see those six pizza slices on their phone regardless of whether they use an iPhone or an Android.

Because emojis are everywhere and iconic, they could be helpful for restaurants and food packaging designers to communicate whether a product is made with common allergens. But as Komatsu's proposal argues, many of the most common food allergens – such as peanuts, soy and milk – are missing or poorly represented by the current emoji library. There is an emoji for octopus, but nothing for squid; there is a loaf of bread that could symbolize gluten, but a bundle of wheat could be clearer and more direct when labelling foods.

It is not uncommon for the Unicode Consortium to add new emojis to the library: several food-related emojis debuted last June, including a long-awaited taco emoji. However, some might complain about the continuing death of the written word if Komatsu's proposal is accepted.`

const t1920OrdAdicB = `The Worst Hotel in the World

The rooms are filthy, there is no hot water and the guests are encouraged to dry themselves off with the curtains to save on washing and in turn 'save the planet'. But customers of the Hans Brinker Budget Hostel in Amsterdam can never say they weren't warned. To prevent complaints, the owners of the \\$22.50-a-night hotel feel it is best to tell people in advance about what to expect, even if that means a potentially fatal disease or mental illness.

A lengthy disclaimer on their website reads: "Those wishing to stay at the Hans Brinker Budget Hotel do so at their own risk." From grotty rooms without a view to dirty bathrooms with no hot water, the owners are happy to admit it is probably the worst hotel around.

The lift is broken so signs point guests towards the 'eco-friendly elevator' – or stairs – and by not providing hot water they claim, "it keeps water consumption moderate." Advertising slogans include "It can't get any worse. But we'll do our best" as well as "Improve your immune system – stay at Hans Brinker!" or the modest claim "Now with beds in every room".

But this hilariously honest approach seems to be a hit with travellers from all over the world, who are rushing to book one of the 127 rooms at the hotel. One traveller from Australia wrote: "For the reputation of the world's worst hotel, it wasn't as bad as I thought. Pretty scabby still, very basic. The bathroom was atrocious." A more promising review reads: "Hans Brinker is a fun-filled hostel with great facilities, friendly staff and great location. You will not be disappointed."`

const t2021ExtA = `TikTok, a Social Media Sensation

Andy Warhol predicted a time everyone would have 15 minutes of fame. He was nearly right – it is actually 15 seconds. That is the maximum duration of a video clip with music (non-music clips can last up to a minute) on TikTok, the video-sharing platform that has taken the world by storm. Favoured by under-20s, who make up its core audience, TikTok this year surpassed Facebook and WhatsApp as the world's most downloaded non-gaming app.

TikTok's content doesn't take itself too seriously, and ranges from food to fashion, pranks to pets – as well as the omnipresent dance challenges. It is a perfect fit, in other words, for the lockdown, when many of us were stuck inside and in desperate need of some silly fun. What makes it stand apart from Snapchat is one crucial difference: the closely guarded algorithm that produces the app's opening dashboard. Unlike other apps, this home screen is not full of people you are following. That is because the algorithm searches for new clips rather than pushing already popular ones. So, you don't need lots of followers to go viral.

TikTok as a family business is not uncommon. One of the most famous TikTok families is the Harfins (Felicity and her sons). Their 1.8 million followers watch the family play pranks, dance, and cook. Felicity, a former marketer, runs the account and has helped to turn it into a business giving clients the chance to be mentioned or promoted in their videos. Indeed, it is now Felicity's main job. But it was the boys who initiated the project. "They grew up watching videos online and always wanted to create themselves." It took them years to persuade her. "I didn't realise how much fun it was going to be."`

const t2021ExtB = `Gap Years for Every Student

Taking a gap year – a period of time during which a student takes a break from studying after school and before college or university – has long been considered a rite of passage. Students delay advanced academic studies to spend a year in the world focused on experiential education, internship, volunteer work and gaining real-world experience to complement the classroom learning.

It is not so much a year "off" of school, as a year "on" your own terms used to experiment with interests and pursue passions that may clarify a student's future career path. Academic experts say that students who take gap years will frequently be more mature, more self-reliant and independent than non-gap year students. Career advisors state that taking a year out can set you apart from other applicants.

The benefits of taking a gap year aren't just a matter of opinion. Research statistics show that 90 percent of students who took a gap year returned to college within a year and confirmed that this experience had an impact on their choice of academic major and career. Students who have taken a gap year report being satisfied with their jobs and figures confirm that 88 percent of them improved their employability thanks to this experience.

The question that is hotly debated, of course, is that of economic parity. Traditionally, gap years have been seen as something for children of wealthy families. While statistics indicate that 18% of students taking a gap year come from families with high-income levels, 19% came from families with more limited incomes. Therefore, the value of a gap year is widely recognized and even families in the lower to middle income brackets are investing in this experience for the educational benefit of their students.`

const t2021ModA = `Flashes on the Moon

Scientists across the world are puzzled as to why there are flashes appearing on the surface of the moon. They refer to them as "transient lunar phenomena". This unusual phenomenon has been happening several times a week. Sometimes the flashes of light are very short, while at other times the light lasts longer. Scientists have also observed that on occasion, there are places on the moon's surface that darken temporarily. Experts on the moon have been speculating on what is behind the flashes. One scientist said the impact of a meteorite can cause the moon's surface to glow briefly. Another scientist wondered whether the flashes occurred when electrically charged particles of solar wind reacted with moon dust.

"Seismic activities were also observed on the moon. When the surface moves, gases that reflect sunlight could escape from the interior of the moon. This would explain the luminous phenomena, some of which last for hours," says Hakan Kayal, Professor of Space Technology. As a first step, Kayla's team built a lunar telescope and put it into operation in April 2019. It has been set up in a private observatory in Spain, about 100 kilometres north of Seville in a rural area. Why Spain? "There are simply better weather conditions for observing the moon than in Germany," says Kayal. He is most interested in these appearances. "The so-called transient lunar phenomena have been known since the 1950s, but they have not been sufficiently observed," he added.

This is currently changing, and the professor wants to make his contribution. Professor Kayal said, "Anyone who wants to build a lunar base at some point must of course be familiar with the local conditions." What if such plans should ever become concrete? By then, at the latest, it should be clear what the mysterious flashes and luminous phenomena are all about.`

const t2021ModB = `Is Reading Affected by Gender?

Boys whose classmates think reading is for girls are more likely to perform poorly in this area, a study suggests. To conduct the study, researchers quizzed a total of 1,508 fifth-grade students in 60 classes in Germany, who had an average age of 10. The children filled out questionnaires in which they ranked whether they thought boys or girls were better at reading, which gender read more, and which gender had more fun doing so. They also rated their own enjoyment and skill in the activity, and completed reading tests.

Past studies have suggested the stereotypes that reading is for girls and maths is for boys are pervasive, so the researchers wanted to see if this could contribute to a gap in skills. The study revealed that boys who believed gender stereotypes about reading were less likely to see themselves as competent and motivated in this regard. They also found boys whose classmates thought reading was for girls not only had similar attitudes about themselves, but also appeared to perform worse in tests. The gender stereotype didn't appear to affect girls positively or negatively.

However, the authors acknowledged that their findings don't prove that gender stereotypes make boys worse at reading and said their data might not be accurate as they relied on the children's honesty. One of the authors of the study said: "To reduce socially determined gender disparities in reading, it may help to create classroom contexts that discourage students from acting on their stereotypical beliefs."

The study is the latest to examine how gender stereotypes affect young people. Late last year, a separate team of researchers found teaching teenage boys about gender equality could prevent them from being violent.`

const t2122ExtA = `Can our Bodies Withstand Global Heating?

"Every human being is at risk from extreme heat – it's a fact of life, your body needs to function in a certain environment," says Mike McGeehin, environmental health epidemiologist. "And when that environment becomes extreme then you are at risk." The impact of extreme heat on the human body is not unlike what happens when a car overheats. Failure starts in one or two systems, and eventually it takes over the whole engine until the car stops.

The hypothalamus, located in the brain, regulates body temperature using information passed to it by temperature sensors in our skin, muscles, and other organs. When high temperatures are detected, the brain initiates a cascade of responses to help us cool down, such as sweating, increased respiration and the impulse to seek water and cooler environments. But when the system overheats, these responses start to fail, and miscommunication can occur in the brain, contributing to confusion, dizziness and altered behaviour. Each organ responds differently to extreme heat exposure, with symptoms that quickly become fatal or cause permanent damage from which the body may never fully recover. For instance, to sweat and cool off, blood flow shifts to the periphery of the body, causing a fall in blood pressure in vital organs. The heart starts to beat faster to compensate, but, if the person does not replenish their water reserves, blood pressure can drop dangerously and cause fainting.

Between 1998 and 2017, more than 166,000 people died due to heat, according to the World Health Organization (WHO), and countries around the world are experiencing a year on year rise in record-breaking high temperatures. For many people, unendurable heat is becoming the new normal. It is most likely to disproportionately affect the poor, the sick – those with chronic conditions, or heart and kidney disease in particular – and older people.`

const t2122ExtB = `The Rise of the 'Granfluencer'

Over the past decade, social media platforms like Instagram, TikTok and YouTube have rapidly grown in importance. According to a recent report, more than 45% of the world's population is tapped into social media. Within this large number, there's a common misconception that most people posting, liking, and commenting on social feeds are twenty-somethings and younger. The truth is, many seniors have broadened their horizons when it comes to technology. According to a research study, the percentage of adults aged 65 and older who used social media grew from 3% in 2005 to 45% in 2021.

Some seniors have even become 'granfluencers', and people of all ages can't get enough of their content. Granfluencers are senior influencers who know their way around social media and use their popularity to make money (snapping pics, recording videos, and learning the art of selfies). This group also engages in leisure tasks that do not generate income, such as tech and travel, working out and dining out, all while sharing on social media.

The added bonus with granfluencers is that there's immense value in their wisdom and life experiences, filling the need of audiences that seek out content that encourages diverse voices and makes them feel good. After all, what's more heart-warming than a grandma enjoying a product she loves or having fun with the latest TikTok challenge? There are quite a few seniors sharing their authentic voices in the social space these days — some of the best-known granfluencers include 92-year-old performance artist Helen Ruth Elam and 75-year-old Joan MacDonald, who is a health and fitness influencer. Women aren't the only ones boosting ratings and capturing hearts, though: Nicky Elliott is a lively and entertaining man who helps people enjoy and learn sign language through music.`

const t2122ModA = `The Future of Jobs and Skills

Students entering formal education today will be making decisions about their career by 2030, so the future of jobs and skills is a key issue in education. Many people seem to know what the future will be: Robots will take our jobs.

Nowadays, anxiety about workers being replaced by robots is increasing, although fear of automation and technologically-driven unemployment have arisen throughout the centuries, usually provoked by a disruption, like the Industrial Revolution. Nevertheless, historically, technology has created more jobs than it has destroyed. We don't know if it will be different this time, but we know that automation is only part of the story.

Equally important are other related trends including demographics, urbanization, globalization, inequality, political uncertainty, and climate change. For instance, urbanization and globalization are trends that interact with climate change and drive the green sector. Currently the green economy is creating new jobs faster than jobs are disappearing in the polluting sectors. Understanding how these trends interact is critical to understanding the jobs and skills needed in the future.

Recent studies have found out that 70% of workers are in jobs with uncertain future, and this must be improved with the right skills preparation. For instance, in the US there is strong emphasis on interpersonal skills – teaching, social perceptiveness, service orientation, and persuasion – and higher-order cognitive skills such as complex problem solving, originality, and active learning. Besides, occupations must be re-designed to pair uniquely human skills with the productivity gains from technology. For example, while robots will be able to build bridges and diagnose diseases, humans will retain the unique ability to engineer a bridge and care for a sick child. How we balance those skills with technology productivity will determine the course of our workforce.`

const t2122ModB = `Social Media and Mental Health

The rise of social media has meant that people are more connected than we have ever been in the history of time. But our reliance on social media can have a detrimental effect on our mental health, with the average British person checking their phone as much as 28 times a day. While social media platforms can have their benefits, using them too frequently can make you feel increasingly unhappy and isolated in the long run. The constant bombardment of perfectly filtered photos that appear on Instagram are bound to knock many people's self-esteem. In addition, obsessively checking your Twitter feed just before bed could be contributing towards poor quality of sleep.

Social media can be great for looking back fondly on memories and recounting how past events occurred. However, it can also distort the way in which you remember certain pleasing things from your life. Many of us are guilty of spending far too much time trying to take the perfect photo of a visual marvel, all the while not actually absorbing the first-hand experience of witnessing it with your own two eyes. "If we direct all of our attention toward capturing the best shots for our social media followers to admire, less will be available to enjoy other aspects of the experience in real time," said Dr Bono.

Not only has social media been proven to cause unhappiness, but it can also lead to the development of mental health issues such as anxiety or depression when used too much or without caution. In March 2018, it was reported that more than a third of Generation Z from a survey of 1,000 individuals stated that they were quitting social media for good as 41 per cent stated that social media platforms make them feel anxious, sad or depressed.`

const t2223ExtA = `The Origin of Chess

Chess is one of the world's most popular and beloved games. Almost 605 million players around the globe enjoy it regularly — about 8% of the world's population. While most games are forgotten one decade after their invention, chess has survived the test of time. The game also got a boost thanks to the 2020 Netflix series The Queen's Gambit, with around 62 million watchers within its first four weeks. This led to a chess-buying boom, with eBay seeing a 215% increase in chess-set sales in the weeks after the show was released.

Its specific origins are difficult to determine, but most historians think the game originated in India. This is due to an ancient legend with written records dating from 1256 that names Grand Vizier Sissa Ben Dahir as the game's originator because he gifted the first chessboard to King Shirham of India. Against this theory, a few scholars follow the Spanish chess player and researcher Ricardo Calvo. He wrote that "most certainly it was invented in Iran", a conclusion reached largely on the basis that ancient Persian literature mentions chess prior to it ever being mentioned in Indian literature.

Regarding the game age, there is no credible evidence that chess existed in a form approaching the modern game before the 6th century. Since that time, the game has evolved, with different cultures introducing both minor and major changes. Most regional cultures — those rich and unified enough to expand geographically — had their own forms of chess. In time, however, chess became more standardized thanks to the influence of 15th-century mathematician Luca Pacioli, who wrote On the Game of Chess. His book quickly established itself as a "chess bible", codifying the rules and popularising the game the way it is known today.`

const t2223ExtB = `The Case against Energy Drinks is Getting Stronger

Energy drinks are popular among teens and adults, but studies continue to show they may have serious side effects, including high blood pressure and hyperactivity.

In a report published in Pediatric Emergency Care, from 2011 to 2013 researchers conducted a questionnaire at two emergency departments that surveyed adolescents between ages 12 and 18 about their energy drinks habits in relation to health issues. Of the 612 young people who responded, 33% said they drank them frequently. Among those teens, 76% said they had suffered a headache in the last six months, 47% said they had experienced anger and 22% reported difficulty when breathing. It is impossible to say whether any of those behaviors were due to power drinks, but young people who consumed them were more likely to report the symptoms than those who didn't. However, those who drank energy drinks were more inclined to say they helped them to do better in school or in sports, to focus and to stay up at night.

Energy drinks contain multiple stimulating ingredients beyond caffeine. "Often energy drinks contain an energy blend which is a combination of herbal supplements as well as vitamins in often greater levels than the appropriate daily intake," says one of the researchers. "Further research may be needed to determine their use and dosages."

As Time magazine has previously reported, energy drink companies insist their products are safe and that a link between their beverages and side effects can't be confirmed. They claim that their products give an energy boost and improve physical and cognitive performance. However, studies supporting these statements are limited: although power drinks may have beneficial effects on physical performance, they also have possible adverse health consequences. The promotion of energy drinks should be limited until independent research confirms their safety, particularly among adolescents.`

const t2223ModA = `Why is Bangkok the Most Visited City in the World?

In my more than decade of global wanderings, Bangkok is the one place that always comes to mind first when I decide I need a culturally interesting place to work remotely for a few months. Apart from digital nomads and low cost of living, it's a city with great food markets and thousands of temples.

Bangkok is a city with an estimated population of 10 million as of 2020. It is one of the most popular cities in the world - it's even been officially named the most-visited city, beating out Paris, NYC, London, and others. But it begs the question: Why is Bangkok so perennially popular? And what makes the city so interesting? Let's dive right into a few of the things that make this city top the charts for travelers and visitors from all over the world.

Sure, Bangkok doesn't come close to the cleanliness of sparkling new cities like Dubai or Singapore, but you'll be hard pressed to find much litter in the city. Locals sweep the streets by hand every day, and in many cases vendors and business owners wash their portion of the sidewalks with buckets of water. Street vendors in particular have an incentive to keep their place of business clean.

Thailand might not have the lowest cost of living in the world, but compared to North America, Europe, Australia or Japan, Thailand is downright cheap. Thailand has issues with corruption, but it's far from the worst place in the region. As a traveler, Bangkok is safe: outside of the pickpockets and scams that you can find in any major city, Bangkok boasts a very low crime rate which means that travellers of all ages and backgrounds feel good about starting their Southeast Asia travels in this regional hub.`

const t2223ModB = `Sports in America

Youth is synonymous with energy — mental and physical. Organized and informal sports offer teens the opportunity to expend some of that energy and, more importantly, to learn the value of fair practice, to accomplish objectives, and to just have fun.

In 2003, 58% of boys and 51% of girls in American high schools played on a sports team. The most commonly chosen sports by boys are American football, basketball, track and field, baseball, and soccer (international football). But for girls, the most prevalent are basketball, track and field athletics, volleyball, softball, and soccer. As a result of a U.S. law that encourages women to take part in athletics, girls' participation in high school athletics has risen by 800% over the past 30 years. Other organized high school sports often include gymnastics, wrestling, swimming, tennis, and golf.

Away from school, teenagers participate year-round in community-sponsored sports leagues. Besides, particularly in the summer, young people participate informally in one sport or another in the streets and parks of their neighborhoods. A high percentage of high school seniors reported taking part in music and performing arts activities, academic clubs, student council, and the school newspaper.

Sports also play a crucial role in the everyday social scene at American colleges and universities. There are university sports programs at the intercollegiate (organized competition) and internal (club-like, less competitive) levels. Grants are offered at the intercollegiate level to students who are both academically qualified and skilled in a sport. Athletic scholarships are awarded for everything from archery to wrestling, with an eye on gender equality to achieve a balance between men's and women's scholarships. These scholarships are administered directly by each academic institution on a percentage basis and universities have strict limits on the total amount they can award each year.`

const t2324ExtA = `World's Deepest Hotel

The deepest sleep experience in the world has just opened in North Wales, offering people the chance to stay overnight in an abandoned Victorian mine, 1,375 feet below the surface. Deep Sleep, the latest creation by Go Below's founder, Miles Moulding, is a unique adventure like no other. Set below the mountains of Snowdonia above, Deep Sleep was tunneled by miners over a century ago to mine minerals at the bottom of the sea. It comprises four private twin-bed cabins and a romantic cavern with a double bed.

Once you've met your trip leader at the base, he will drive you to a little cottage to give you a hard head protector, and water-resistant boots. Then, you will embark on a 60-minute walk to the mine, navigating an old stairway and deteriorated bridges. Food will also be provided once you arrive; the price includes an expedition-style meal to eat at the large picnic table. The route down is not for the fearful but don't worry, you won't be left alone in the mine. Your instructor and a member of technical staff will remain in their own cabin next to you, ready to prepare breakfast the following morning. Once you've eaten, it will be time to embark on the long climb up to the sea level.

Speaking about the experience, Deep Sleep say: "The trip to reach it is an adventure in itself, journeying for over an hour through tunnels and channels carved by those miners. One of Go Below's experienced and qualified trip leaders will guide guests through the caverns, showing the visitors some fascinating sights and giving an insight into the history of the mine and the lives of the men and boys who worked there. You can live a totally different ecosystem, and, most important, get away from screens for a couple of days."`

const t2324ExtB = `What Air Pollution Does to our Lungs

The World Health Organization is on a mission to make politicians understand that the climate crisis is a health crisis. Dr. María Neira (Director of the Department of Public Health and Environment) used the Cop28 summit last December to wake people up to the tremendous human cost of a global economy based on coal, oil and gas, and to make every politician take action immediately. "Are you ready to cope with the consequences of your inaction?" she said. "You have to live with that weight on your shoulders. You are not saving those lives – I don't want to say killing – but you are definitely not protecting the lives of those people."

That brings us back to our lungs. Burning fossil fuels leads to air pollution, which kills millions of people due to lung illnesses each year. Only blood pressure, smoking and diet play a bigger role in early deaths in the world. Nevertheless, the difference is that we have direct control over those three; we can decide how much exercise we do, whether we smoke, and what we eat.

Air pollution is a far bigger killer than extreme climate, which dominates discussions nowadays. But fortunately, stopping climate change and cutting air pollution go hand in hand. The shift to clean energy implies burning fewer fuels that emit toxic particles.

Doctors see "co-benefits" like this everywhere. Cleaning up transport implies fewer vehicles, cleaner cars, and more walking and cycling, all of which can save 5 million lives a year. Cleaning up agriculture implies a shift to healthier diets that can save millions more. Taken together, these health benefits strongly support a fast climate action. And Neira is confident she can make policymakers see this too.`

const t2324ModA = `Nobel Prize for Studying Neanderthal DNA

Monday 3rd October 2022, the Nobel Committee for Physiology or Medicine awarded the prize to Svante Pääbo, a smart Swedish geneticist who determined how to extract and analyze DNA from 40,000-year-old Neanderthal bones – an extremely complex and challenging process. His decades of research have made it possible for scientists to begin testing differences between today's modern humans and their ancestors.

Born in 1955, Pääbo spent three decades working on the Neanderthal genome, mostly at the Max Planck Institute in Leipzig, Germany. He studied mummies and extinct animals before focusing his efforts on Neanderthals. "I'm driven by curiosity, by asking the questions, 'Where do we come from?' and 'What were the important events in our history that made us who we are?'", Pääbo told Smithsonian magazine in 2006.

The morning of the 3rd of October, Pääbo was finishing a cup of tea when he got a call from Sweden informing him he had been awarded with the Nobel Prize. He was asked whether he ever thought of winning. Pääbo humbly replied that he did not really think that this study would qualify for a Nobel Prize. But award-winning scientific discoveries are apparently in Pääbo's blood. His father, biochemist Sune Bergström, shared the Nobel Prize in Physiology and Medicine in 1982. This was the eighth time that a child of a Nobel laureate also won a Nobel Prize.

Pääbo's unexpected win marked the outstanding start of last year's Nobel Prize announcements, which continued throughout the rest of that eventful week with awards in physics, chemistry, literature, economics, and peace. Winners get roughly 900,000€, which come from the money left by the prize's creator, Alfred Nobel, after his death, in order to contribute to science evolution.`

const t2324ModB = `TikTok's Rise

TikTok in 2022 became the most-downloaded app in the world, quietly surpassing forerunners Instagram and Twitter. By the end of 2023, it will overtake YouTube as the social media platform that users spend the most time watching. The video platform's meteoric rise has surprised investors and industry experts. As it grows at fast speed, the newspaper The Guardian investigates some of the many questions surrounding its operations: the opaqueness of its algorithm and its effect on our brains.

TikTok's sprint towards world dominance began in 2018, when it first surpassed Facebook, Instagram, Snapchat, and YouTube in downloads. The following year, it became the fourth most-downloaded non-gaming app in the world. In 2020, the Covid-19 pandemic poured gasoline on the app's already-explosive growth. As billions of people struggled through repeated lockdowns, the app increased downloads, reporting a 45% rise in monthly active users. A recent report showed that nearly half of people between 18 and 30 in the US use the platform and 67% of users between the ages of 13 and 18 use the app daily.

TikTok's algorithm, which serves intensely specific content to users, is a key element of its success. The platform, according to internal documents leaked in 2021, optimizes content for minutes and hours of view time – a departure from its competitors who historically prioritized clicks and engagement. That significant difference and its algorithm's impressive efficacy have raised alarm at the mental health impact of such intensive targeting.

Concerns about the consequences of extensive social media use have also been long standing, with studies suggesting excessive use can exacerbate mental health problems. Besides, TikTok comes with its own problems, including that its algorithm feed can make unhealthy trends go viral before they can be banned for safety.`

const t2425ExtU = `Would You Eat Insects?

Chef Joseph Yoon is a renowned cook who is popularizing the age-old practice of eating insects. He is used to people reacting negatively to his creations: he's watched a child cry when she realized the pumpkin cake in her mouth was made with cricket powder, seen a grown adult spit out food that contained bugs and suffered racist online comments aimed at him for suggesting that scorpions are worth eating. But none of that seems to discourage Yoon. If anything, it just reaffirms the importance of his work removing stigma from this practice of eating insects. As the founder of an organization called Brooklyn Bugs and a self-described "insect ambassador", Yoon is on a mission to prove that eating insects is good for the planet—and the mouth.

Yoon's work includes giving presentations everywhere from elementary schools to Harvard and working with museums and institutions like NASA on sustainable food initiatives. Occasionally, he cooks for journalists, scientists and environmentalists. His main objective is to raise awareness about the planetary benefits and culinary joys of eating bugs. "I like to share the sense of hope and optimism, and to be able to capture people's imagination through cooking insects," Yoon said from his kitchen table in New York over some fried crickets. "The question is: how do we start changing the perception from insects as disgusting animals to something that's sustainably farmed, nutrient dense and that can add a tremendous amount of flavor to your food?"

Insect consumption has been highlighted by the UN's Food and Agriculture Organization as an important tool in addressing food insecurity for a growing global population. And, since agriculture is the second-largest greenhouse gas emitter after the energy sector, insect eating presents a good climate solution too. Crickets, for example, can provide the same amount of protein as cows for less than 0.1% of the emissions.

Yoon pointed out that people have been eating insects since long before the practice was recognized as a climate win. "There are over 2 billion people in 80% of the world's nations that are already regularly consuming insects," he said. But the stigma and disgusting factor that persist in many places, including much of the US, are what Yoon is interested in changing. His approach is to lead with the joy of eating. Learning to enjoy consuming bugs might require some training of your tastes depending on where you grew up, he said, but we apply that training whenever we try new foods from unfamiliar cultures or teach our kids to eat vegetables.`

const t2425ModU = `Breath Meditation: A Great Way to Relieve Stress

Stress can be defined as a state of worry or mental tension caused by a difficult situation in your personal life that prevents you from relaxing. Everyone experiences stress from time to time. However, according to an article published by the Harvard Medical School, psychological stress has a devastating effect on health. Research shows that people with heart disease do worse over time if they don't control stress, and stress seems to be associated with a higher risk for cancer, poorer memory, and more aches. However, reducing stress helps you sleep restfully and control high blood pressure.

One of the easiest ways to reduce stress is connected to breathing. Paying attention to your breath is a form of "entry level" meditation that anyone can do. You'll notice an immediate sense of relaxation that could help protect your health over time. Simple breathing meditation requires only that you find a comfortable position in a place with minimal distractions. You may sit, stand, or walk—whichever you prefer. Many people find the sitting position to be best.

If you enjoy it, breath meditation can be a gateway to a broader practice of "mindfulness," in which you learn to accept and appreciate what comes in life and stop fighting your own thoughts and feelings. Mindfulness is a concept that originated in Buddhism, although its fundamental principles are shared by many spiritual traditions, philosophies, and religions. Mindfulness simply means the practice of purposely focusing your attention on the present moment—and accepting it without judgment.

"Many people take up mindfulness practices thinking they'd like to relax more, but where it leads is a very different approach to life and its inevitable challenges," says Dr. Ronald D. Siegel. The mind can be a noisy, busy place. As you try to focus your attention, thoughts will often arise. The key is not to get annoyed or impatient with your restless mind. Acknowledge the thoughts and let your attention slip from them. "Learning to focus attention and relax is a skill," Dr. Siegel says. "As with any skill, your ability to focus and relax will improve with practice."`

const t2526ModU = `The Reinvention of an Irish Tourist Town

Located on the shores of a lake and surrounded by mountains and valleys, Killarney is one of the most beautiful places in Ireland. It is a small town whose roots as a tourist destination go back to 1747, when a nobleman named Thomas Browne inherited the Killarney estates, went there and discovered an empty place with a lot of debt. Nevertheless, he saw tourism potential in the beauty of Killarney's lakes, Muckross Abbey and Ross Castle, which date to the fourteenth and fifteenth centuries, respectively. So, he organised the planting of trees, the repairing of roads and the building of little hotels. The arrival of the railway in 1853 and Queen Victoria's 1861 visit did the rest. Killarney was officially a tourist hot spot, its reputation for its natural beauty extending far beyond Ireland's shores.

In the twentieth century, things changed for the worse in Killarney. Hotels proliferated, suburban areas grew and roads became packed with cars. Moreover, you were more likely to be tortured by people partying than to be delighted by nature. By the 1980s, Killarney was synonymous with all that was awful in places destroyed by mass tourism. However, a group of locals were not willing to give up on their home's natural beauty. Over the past few years, thanks to tenacity and a huge community effort, Killarney has managed to reinvent itself by adopting some brilliant green ideas, and the results are remarkable.

When I recently visited it, I realised that getting to Killarney can be sustainable in itself. The train station is in the centre of town so it is quite possible to travel without flying or driving. My first stop was Luna Cafe, where I happily had coffee in the afternoon sun. Soon after, I heard some Americans debating the pleasures of one of Killarney's most typical attractions, a two-wheeled cart pulled by a horse called a "jaunting car". Around me, there was a mix of accents, including plenty from the corners of Ireland. Most people were remarking on the surrounding beauty, many were planning their next adventure, and some were getting their coffees to-go. But what they weren't getting was a cardboard cup. Killarney is the first town in Ireland to ban single-use coffee cups. Visitors are encouraged to bring their own reusable cups, or they can, for a €2 deposit, get an Irish-made one to be returned at any coffee shop or kept for future use. Killarney is now a clean and beautiful spot for nature lovers, and it is highly recommended as a destination to visit in every season.`

// ─── Shared correction criteria strings ──────────────────────────────────────


// ── 2021-2022 Ordinaria coincidencias/adicional Madrid ──────────────────────
const t2021OrdCoinA = `In Praise of Loud Women
The label “loud woman” has never been a compliment, even though some women
may wear it as a badge of honour. In everyday life, there is still something
uncomfortable for a woman about being called loud, because the implication is
that a) you don’t care about the people around you and b) you don’t care what
other people think about you. Anecdotally, many women will say that they
learned from an early age that being loud – whatever this means – was not
welcome behaviour.
What a loud woman looks like, though, has changed hugely in the past two
decades. With Michelle Obama publishing her autobiography, Becoming, it is
clear that a new generation of women want to redefine the term. As the former
first lady puts it: “I admit it: I am louder than the average human being and I have
no fear of speaking my mind. These traits don’t come from the colour of my skin,
but from an unwavering belief in my own intelligence.” If you ask women whom
they would most like to be as a public speaker, many will say Obama. Her
speaking style – controlled passion, warm authority, approachable charisma – is
extremely attractive. She is the new kind of loud: the volume is calculated and in
tune with the audience.
Thanks to digital platforms and social media, there has been a huge shift in the
past twenty years in how women communicate and build a platform. Many of the
women in the Top 10 chart of most popular TED speakers cannot be defined as
loud, although their reach is extraordinary and they have built lucrative careers
off the back of it. Often their message is about how to have your quiet voice heard
in a noisy world.
Adapted from “In praise of loud women,” The Guardian, October 6th, 2018.
< https://www.theguardian.com/lifeandstyle/2018/nov/06/ >`

const t2021OrdCoinB = `Dogs are Humans’ Oldest Companions
A study of dog DNA has shown that our “best friend” in the animal world may
also be our oldest one. The analysis reveals that dog domestication can be traced
back 11,000 years, to the end of the last Ice Age, and that they were domesticated
before any other known species.
Our canine companions were widespread across the northern hemisphere at this
time and had already split into five different types. Despite the expansion of
European dogs during the colonial era, traces of these ancient indigenous breeds
survive today in the Americas, Asia, Africa and Oceania.
The research fills in some of the gaps in the natural history of our close animal
companions. Dr Skoglund told BBC News: “Dogs are really unique in being this
quite strange thing if you think about it; when all people were still hunter
gatherers, they domesticated what is really a wild carnivore – wolves are pretty
frightening in many parts of the world.” To some extent, dog genetic patterns
mirror human ones, because people took their animal companions with them
when they moved.
G. Larson, a co-author from the University of Oxford, said: "Dogs are our oldest
and closest animal partner.” Dogs are thought to have evolved from wolves that
ventured into human camps, perhaps sniffing around for food. As they were
tamed, they could then have served humans as hunting companions or guards.
Dr Skoglund said it was unclear where the initial domestication occurred: “Dog
history has been so dynamic that you can’t really count on it still being there to
readily read in their DNA. We really don’t know – that’s the fascinating thing
about it.” Many animals, such as cats, probably became our pets when humans
settled down to farm the land a little over 6,000 years ago.
Adapted from “Dogs are humans’ oldest companions, DNA shows,” BBC News,
October 30, 2020. <https://bbc.in/2TOkLks>`

const t2022OrdCoinA = `Knocker Uppers
Until the 1970s in some areas, many workers were woken by the sound of a tap at their bedroom
window. On the street outside, walking to their next customer's house, would be a figure holding a long
stick. The "knocker upper" was a common sight in Britain, particularly in the northern mill towns, where
people worked shifts, or in London where dockers kept unusual hours. While the standard implement
was a long fishing rod-like stick, other methods were employed, such as soft hammers, rattles and even
pea shooters.
"They used to come down the street with their big, long poles," remembers Paul Stafford. "I would sleep
with my brother in the back room upstairs and my parents slept in the front. The knocker upper wouldn't
hang around either, just three or four taps and then he'd be off. We never heard it in the back, though
it used to wake my father in the front."
One problem knocker uppers faced was making sure workers did not get woken up for free. "When
knocking up began to be a regular trade, the public complained of being bothered by our loud rapping
or ringing,” Mrs. Waters, a knocker upper in the north of England told Canada's Huron Expositor
newspaper in 1878. "Knocker uppers also found out that while they knocked up one who paid them,
they knocked up several on each side who did not," she continued. The solution they hit on was
modifying a long stick, with which to tap on the bedroom windows of their clients, loudly enough to wake
up those intended but softly enough not to disturb the rest.
The trade spread rapidly across the country, particularly in areas where poorly paid workers were
required to work shifts but could not afford their own watches.
Adapted from “Knocker uppers: Waking up the workers in industrial Britain,” BBC News, March 27,
2016. <https://www.bbc.com/news/uk-england-35840393>`

const t2022OrdCoinB = `The Secret History of ‘Monopoly’
One night in late 1932, a Philadelphia businessman and his wife, Todd, introduced their friends
Charles and Esther Darrow to a real-estate board game they had recently learned. As the two
couples sat around the board, enthusiastically rolling the cube, purchasing properties and moving
their tokens around, Mr. Todd was pleased to note that the Darrows liked the game. Charles Todd,
in fact, made them a set of their own, and began teaching them some of the more advanced rules.
The game didn’t have an official name: it wasn’t sold in a box but passed from friend to friend.
However, everybody called it ‘the monopoly game’.
Together with other friends, they played many times. One day, despite all of his exposure to the
game, Darrow – who was unemployed, and desperate for money to support his family – asked
Charles Todd for a written copy of the rules. Todd was slightly perplexed, as he had never written
them up, nor did it appear that written rules existed elsewhere.
The truth is that the rules to the game had been invented in Washington DC in 1903 by a bold,
progressive woman named Elizabeth Magie. But her place in the game’s folk history was lost for
decades. Today, Magie’s story can be told in full. But even though much of the story has been
around for 40 years, the Charles Darrow myth persists as an inspirational parable of American
innovation – thanks in no small part to Monopoly’s publisher and the man himself. After he sold a
version of the game to Parker Brothers, it became a phenomenal success, eventually making him
a millionaire. One journalist after another asked him how he had managed to invent Monopoly, “It’s
a freak,” Darrow told the Germantown Bulletin, a Philadelphia paper. “Entirely unexpected and
illogical.”
Adapted from “The secret history of Monopoly: the capitalist board game’s leftwing origins,” The
Guardian, April 15, 2015. <https://www.theguardian.com/lifeandstyle/2015/apr/11/secret-history-
monopoly-capitalist-game-leftwing-origins>`


const crit1 = "1 punto por apartado (2 en total). La respuesta TRUE o FALSE debe ir justificada con una cita textual completa. Sin cita = 0 puntos en ese apartado."
const crit1_ng = "1 punto por apartado (2 en total). Indica T/F/NG eligiendo 2 de los 3 enunciados. En T/F copia la oración del texto como evidencia. Si la respuesta es NG, no escribas nada más."
const crit2 = "1 punto por pregunta (2 en total). 0,5 puntos por las ideas parafraseadas + 0,5 puntos por la expresión. No copiar el texto literal."
const crit3 = "0,25 puntos por cada sinónimo correcto adecuado al contexto (4 ítems = 1 punto)."
const crit4_old = "0,25 puntos por cada hueco en blanco correcto. 0,5 puntos por cada transformación o ítem complejo (con carácter unitario). Las respuestas deben ser gramatical, ortográfica y semánticamente correctas."
const crit4_new = "Responde 4 de las 6 cuestiones propuestas. 0,5 puntos por cada respuesta correcta (carácter unitario). La oración debe ser ortográfica, gramatical y semánticamente correcta según las indicaciones dadas."
const crit5_old = "Redacción de 150-200 palabras. 3 puntos: 1,5 pts por dominio del idioma (léxico, gramática, ortografía) y 1,5 pts por madurez en las ideas (organización, coherencia, creatividad)."
const crit5_new = "Redacción de 150-200 palabras eligiendo 1 de 2 opciones. 3 puntos: 6 apartados de 0,5 pts cada uno — adecuación/tarea, ideas/organización, conectores/coherencia, gramática, vocabulario, ortografía."
const crit3_5items = "0,20 puntos por cada sinónimo correcto adecuado al contexto (5 ítems = 1 punto)."

// ─── Helper to build 5 questions for a pre-2024 exam ─────────────────────────

function makePreguntas(
  prefix: string,
  texto: string,
  q1Items: string,
  q2Items: string,
  q3Items: string,
  q4Items: string,
  q5Prompt: string,
  tema: string,
  q4Topics: string[],
  q5Topics: string[]
): PreguntaIngles[] {
  return [
    {
      id: `${prefix}-1`,
      numero: 1,
      bloque: "Q1",
      label: "True / False",
      tema,
      puntuacion: 2,
      enunciado: `Are the following statements TRUE or FALSE? Copy the evidence from the text. No marks are given for only TRUE or FALSE.\n${q1Items}`,
      criterios: crit1,
      texto_fuente: texto,
      topicSlugs: ["comprension-verdadero-falso-con-evidencia-textual"],
    },
    {
      id: `${prefix}-2`,
      numero: 2,
      bloque: "Q2",
      label: "Comprensión abierta",
      tema,
      puntuacion: 2,
      enunciado: `In your own words and based on the ideas in the text, answer the following questions. Do not copy from the text.\n${q2Items}`,
      criterios: crit2,
      texto_fuente: texto,
      topicSlugs: ["comprension-abierta-con-propias-palabras"],
    },
    {
      id: `${prefix}-3`,
      numero: 3,
      bloque: "Q3",
      label: "Vocabulario",
      tema,
      puntuacion: 1,
      enunciado: `Find the words in the text that mean:\n${q3Items}`,
      criterios: crit3,
      texto_fuente: texto,
      topicSlugs: ["vocabulario-en-contexto"],
    },
    {
      id: `${prefix}-4`,
      numero: 4,
      bloque: "Q4",
      label: "Gramática",
      tema,
      puntuacion: 2,
      enunciado: `Complete the following sentences. Use the appropriate form of the word in brackets when given.\n${q4Items}`,
      criterios: crit4_old,
      texto_fuente: texto,
      topicSlugs: q4Topics,
    },
    {
      id: `${prefix}-5`,
      numero: 5,
      bloque: "Q5",
      label: "Redacción",
      tema,
      puntuacion: 3,
      enunciado: `Write about 150 to 200 words on the following topic.\n${q5Prompt}`,
      criterios: crit5_old,
      topicSlugs: q5Topics,
    },
  ]
}

// ─── Exam data ────────────────────────────────────────────────────────────────

export const examenesIngles: ExamenIngles[] = [
  // ── 2017-2018 ─────────────────────────────────────────────────────────────
  {
    id: 1,
    año: 2018,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Romanian's Medieval Marital Prison",
    preguntas: makePreguntas(
      "ing-1718-A",
      t1718A,
      `a) Biertan's marital prison was situated far away from Biertan.
b) Despite the Bishop's policy, several couples in Biertan couldn't save their marriage.`,
      `a) What was this marital prison like?
b) Why did the Bishop, with his marital prison, try to avoid divorces?`,
      `a) meet (paragraph 1)
b) in trouble (paragraph 1)
c) fix (paragraph 2)
d) try (paragraph 3)`,
      `a) Last year, the number of divorces was much _______ (high) than ever before, as _______ (show) by the latest figures from the Office for National Statistics.
b) I'd prefer to spend six weeks in prison instead of _______ (get) a divorce, which _______ (mean) I'd have to leave home and children.
c) I don't remember the name of that Biertan bishop _______ story is written on that church wall in order _______ justify his actions.
d) Complete the following sentence to report what was said. "What shall I do next?" — He asked _____________________________ .`,
      "Single life vs. married life. What would be best for you? Explain your choice.",
      "Matrimonio / Sociedad",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 2,
    año: 2018,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Clara Barton: American Red Cross Founder",
    preguntas: makePreguntas(
      "ing-1718-B",
      t1718B,
      `a) Clara Barton couldn't help soldiers in the battlefield because she wasn't married.
b) Clara first learned about the Red Cross while she was away from home.`,
      `a) What did Clara do just before the end of the American Civil War?
b) What did she do after coming back from Europe?`,
      `a) enthusiastic (paragraph 1)
b) established (paragraph 2)
c) extraordinary (paragraph 3)
d) dedication (paragraph 3)`,
      `a) If I _______ (know) that the Red Cross helped in so many countries, I _______ (join) as a volunteer years ago.
b) From a shy little girl _______ talked in a low voice, Clara Barton _______ (become) a teacher, government clerk and battlefield nurse.
c) After _______ (resign) from the American Red Cross, she founded the National First Aid Society, _______ mission was to promote local first aid programmes.
d) Complete the following sentence to report what was said. "When was the Red Cross founded in your country?" he asked Mary. — He asked Mary _____________________________ .`,
      "Are humanitarian organisations important today? Give reasons to explain your answer.",
      "Historia / Humanitarismo",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2018-2019 ─────────────────────────────────────────────────────────────
  {
    id: 3,
    año: 2019,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Homesickness",
    preguntas: makePreguntas(
      "ing-1819-A",
      t1819A,
      `a) Homesickness is often treated in literature, music and the cinema.
b) One of the symptoms of homesickness is the lack of sleep.`,
      `a) What emotions do people experience when being homesick?
b) What advice is given in the text to mitigate homesickness?`,
      `a) topic (paragraph 1)
b) states (paragraph 2)
c) again and again (paragraph 3)
d) tough (paragraph 4)`,
      `a) After _______ (live) in my new city for three months, I have started feeling less homesick than when I first _______ (move) in.
b) Feeling homesick is compared _______ the emotion that we experience _______ losing a beloved person.
c) _______ (long) you live in a new place, _______ (good) you get to know it, and the less homesick you feel.
d) Complete the following sentence to report what was said. "When did you last visit your hometown?", David asked me. — David asked me _____________________________ .`,
      "Have you ever felt homesick? Describe your experience.",
      "Psicología / Experiencias personales",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },
  {
    id: 4,
    año: 2019,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Change in Activism",
    preguntas: makePreguntas(
      "ing-1819-B",
      t1819B,
      `a) The recent rise in youth protests is closely related to the technological advances which have developed for the last two years.
b) Despite the use of social media, demonstrations are still the most effective way of protesting.`,
      `a) Explain why youths organised activist movements in 2016.
b) What did the #FreePeriods campaign demand?`,
      `a) founded (paragraph 3)
b) objective (paragraph 3)
c) tackle (paragraph 3)
d) frightening (paragraph 4)`,
      `a) If I had known everything was going to be so chaotic, I _______ (not join) the protest last Sunday. It _______ (be) a waste of time.
b) They didn't apologise _______ the trouble they caused. What's worse, they even complained _______ the organisation.
c) _______ (you ever participate) in a social media campaign? If so, who was it organised _______?
d) The young activists, _______ had met at a university event, enjoyed _______ (discuss) new ideas after meetings.`,
      '"Today\'s Spanish youngsters are conformists and feel less committed to social issues than previous generations." Do you agree or disagree, and why?',
      "Activismo / Redes sociales",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2019-2020 Lunes ───────────────────────────────────────────────────────
  {
    id: 5,
    año: 2020,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Lost and Found",
    preguntas: makePreguntas(
      "ing-1920-L-A",
      t1920LA,
      `a) In his wallet, Tim Cameron didn't keep any personal documents that had an address or a telephone number.
b) Cameron didn't show any appreciation for Simon's help.`,
      `a) How do people normally react when they lose their wallets?
b) What was the aim of doing the bank transfers?`,
      `a) spoil (paragraph 1)
b) noticed (paragraph 2)
c) thought of (paragraph 2)
d) only (paragraph 3)`,
      `a) _______ (lose) your wallet is one of _______ (bad) things that can happen.
b) The person _______ wallet I found, had left it _______ the bus.
c) Stop _______ (complain)! We _______ (find) your wallet sooner or later!
d) Complete the following sentence to report what was said. "You won't believe what happened to me!" she said. — She told me _____________________________ .`,
      "Have you ever lost something that was important to you? Describe your experience or imagine one.",
      "Anécdotas / Solidaridad",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos","gerundio-e-infinitivo"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },
  {
    id: 6,
    año: 2020,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Real History behind Game of Thrones",
    preguntas: makePreguntas(
      "ing-1920-L-B",
      t1920LB,
      `a) Viewers and readers have pointed out similarities between Martin's story and historical events.
b) There is evidence that Richard III killed two of his nephews to inherit the throne.`,
      `a) Why didn't Empress Matilda inherit the throne?
b) According to the text, what happened to the Clan MacDonald and why?`,
      `a) admitted (paragraph 1)
b) jailed (paragraph 2)
c) finally (paragraph 2)
d) excessive (paragraph 3)`,
      `a) The series Game of Thrones _______ (base) on the book A Song of Ice and Fire, _______ (write) by George R.R. Martin.
b) My younger sister is not allowed _______ (watch) Game of Thrones because she is not old _______.
c) _______ the fact that Game of Thrones is bloody and sexist, most people _______ have watched it say they like it.
d) Remember _______ (return) Martin's book to the library before the deadline _______ (expire).`,
      "What is your favourite TV series? Describe the plot and say why you like it.",
      "Historia / Entretenimiento",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva","gerundio-e-infinitivo"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },

  // ── 2019-2020 Martes ──────────────────────────────────────────────────────
  {
    id: 7,
    año: 2020,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "A New BBC Period Drama",
    preguntas: makePreguntas(
      "ing-1920-M-A",
      t1920MA,
      `a) This will be the first production by Mira Nair.
b) There will be no white characters in the new BBC series.`,
      `a) How does Andrew Davies think the audience will react to this new series and why?
b) What is the plot of the new BBC series?`,
      `a) screened (paragraph 3)
b) present (paragraph 3)
c) change (paragraph 4)
d) wish (paragraph 5)`,
      `a) Vikram Seth _______ (born) in India, but _______ (spend) most of his life in the UK.
b) I'd _______ watch a period drama than _______ (read) a book.
c) If I had _______ opportunity to travel to India, I _______ (visit) Vikram Seth's relatives.
d) After _______ (watch) the last thriller on Netflix, I couldn't sleep _______ a couple of nights.`,
      "What do you prefer, films or TV series? Justify your answer.",
      "Cultura / Entretenimiento",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 8,
    año: 2020,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Carbon Footprint of your Inbox",
    preguntas: makePreguntas(
      "ing-1920-M-B",
      t1920MB,
      `a) The carbon footprint of emails is not related only to the electricity consumed by computers.
b) The number of spam emails has been reduced thanks to the introduction of specific policies.`,
      `a) What is the relationship between the size of an attachment and its carbon emission?
b) What can we do to reduce the carbon footprint of emails? Mention two ideas.`,
      `a) yearly (paragraph 1)
b) additional (paragraph 2)
c) quantity (paragraph 2)
d) consume (paragraph 3)`,
      `a) Researchers said domestic travel was a bigger cause of CO2 emissions _______ international travel. In fact, air travel was one of _______ (important) causes.
b) _______ (avoid) natural disasters or extreme temperatures, _______ can damage the environment, we must keep the level of greenhouse gases at their natural levels.
c) Some people think that the greenhouse effect _______ (not/become) such a big problem if we _______ (not/cut) so many trees in the past.
d) Rewrite the following sentence so that it means the same: "We are consuming natural resources so fast that the Earth does not have time to renew them." — Natural resources _____________________________ .`,
      "Would you agree to have limited Internet access to help reduce carbon emissions? Justify your answer.",
      "Medio ambiente / Tecnología",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2020-2021 Lunes ───────────────────────────────────────────────────────
  {
    id: 9,
    año: 2021,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Is the Full Stop no Longer Necessary?",
    preguntas: makePreguntas(
      "ing-2021-L-A",
      t2021LA,
      `a) According to the text, several researchers consider that people use the full stop when they want to highlight something.
b) Youngsters think using a full stop shows someone is quite annoyed.`,
      `a) What is the difference between ending messages with a full stop or an exclamation mark?
b) Why do people use emojis when they are messaging online?`,
      `a) behaviours (paragraph 1)
b) clear (paragraph 2)
c) include (paragraph 2)
d) indicated (paragraph 3)`,
      `a) Youngsters who are used to _______ (communicate) electronically break up their thoughts by sending each one as a separate message, _______ than using a full stop.
b) The full stop derives _______ Greek punctuation which _______ (introduce) by Aristophanes of Byzantium in the 3rd century BC.
c) _______ (slight) mistake in punctuating a clause in a contract can have massive unintended consequences. Punctuation _______ (matter).
d) If I were you, I _______ (show) how brilliant I am by manipulating the language _______ the internet.`,
      "Our words have impact. Why is it determining or relevant to think before speaking our minds? Explain.",
      "Comunicación / Tecnología",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 10,
    año: 2021,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Women Spies during World War II",
    preguntas: makePreguntas(
      "ing-2021-L-B",
      t2021LB,
      `a) Women began working as spies at the end of the war.
b) Historical evidence shows that men were better spies than women.`,
      `a) What are the two reasons why Great Britain was in a hard situation during the summer of 1941?
b) Why was speaking French required to be a good spy?`,
      `a) challenging (paragraph 1)
b) quite (paragraph 2)
c) seldom (paragraph 2)
d) every (paragraph 4)`,
      `a) _______ (consider) the most dangerous of all allied spies by the Gestapo, Virginia Hall was particularly good _______ opening locks.
b) _______ women spies worked very hard during World War II, they were paid less _______ men.
c) According _______ official files, there were more than 200 women _______ served as double spies during the war.
d) Complete the following sentence to report what was said. "Who is your preferred woman spy?" — My friend asked me _____________________________ .`,
      "Who is your favourite male or female historical character? Explain the reasons for your choice.",
      "Historia / Segunda Guerra Mundial",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2020-2021 Martes ──────────────────────────────────────────────────────
  {
    id: 11,
    año: 2021,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Special Olympics",
    preguntas: makePreguntas(
      "ing-2021-M-A",
      t2021MA,
      `a) Athletes from all over the world took part in competitions in the Olympic event held in the late 60s.
b) When the US organisers decided to celebrate the event abroad for the first time, they were surprised to find that most countries wanted to host the Games.`,
      `a) Why did Eunice decide to hold a summer day camp in her backyard?
b) What was the reaction of Irish people to the Special Olympic Games they held?`,
      `a) radical (paragraph 1)
b) encourage (paragraph 3)
c) rarely (paragraph 4)
d) happiness (paragraph 4)`,
      `a) After being held in the US _______ several years, Ireland had the chance _______ (celebrate) the event.
b) If I _______ (have) enough time to train properly last season, I _______ (win) a medal.
c) Celebrating the Olympic Games has a huge impact _______ social unity, besides _______ (imply) economic profit for the hosting country.
d) Complete the following sentence to report what was said. "We don't expect many people in the country will volunteer." — Organisers said _____________________________ .`,
      "If you could volunteer at an important event, what type of event would you prefer and why?",
      "Deporte / Diversidad",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 12,
    año: 2021,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Students Vote and Work the Polls, Despite the Pandemic",
    preguntas: makePreguntas(
      "ing-2021-M-B",
      t2021MB,
      `a) Few young Americans have traditionally voted.
b) Students were too exposed in presidential elections.`,
      `a) Why were young Americans interested in US 2020 presidential elections?
b) How was social media used in US 2020 Elections?`,
      `a) eagerness (paragraph 1)
b) urging (paragraph 2)
c) truly (paragraph 2)
d) hold (paragraph 3)`,
      `a) The return to school in the coronavirus pandemic is creating additional stress _______ a time already filled _______ anxiety.
b) _______ can reporters prepare the public _______ the possibility that results will not be available on election night?
c) Studies indicate that people _______ don't vote when they're eligible are more likely to _______ (rare) vote in the future.
d) Millennials and Generation Z represent a _______ (large) voting bloc _______ Baby Boomers.`,
      "Should voting be compulsory? Justify your answer.",
      "Política / Participación ciudadana",
      ["gramatica-transformacion-y-uso-de-estructuras","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2021-2022 Lunes ───────────────────────────────────────────────────────
  {
    id: 13,
    año: 2022,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: 'Firms Hire for "Cultural Fit"',
    preguntas: makePreguntas(
      "ing-2122-L-A",
      t2122LA,
      `a) Not being 'cultural fit' is never used as an excuse to turn down candidates because of their personality.
b) Sandra Okerulu's position was taken by another candidate.`,
      `a) Which two consequences can potential workers suffer if rejected for not being 'cultural fit'?
b) How can companies benefit from not applying the 'cultural fit' policy when hiring workers?`,
      `a) seeking (paragraph 1)
b) soon (paragraph 1)
c) tests (paragraph 2)
d) make up (paragraph 3)`,
      `a) Hiring is often subjective, _______ means some applicants may not be selected even _______ they have excellent qualifications.
b) When writing an _______ (apply) for a job, recruiters suggest _______ (include) skills and work experience in the resume.
c) Some jobs require being good _______ digital marketing, such _______ social media.
d) Candidates who are culturally fit _______ (think) to be _______ (bad) for a firm than others.`,
      "Is cultural diversity good for society? (Think about school, social relationships, work, etc.). Discuss.",
      "Trabajo / Diversidad",
      ["gramatica-transformacion-y-uso-de-estructuras","comparativos-y-superlativos","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 14,
    año: 2022,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Environmental Impact of the Clothing Industry",
    preguntas: makePreguntas(
      "ing-2122-L-B",
      t2122LB,
      `a) EU clothes consumption has no consequences for non-EU countries.
b) New regulations were approved to make all EU states classify clothing waste.`,
      `a) Which reasons have caused the increase in clothes sales in recent years?
b) How can clothes re-use or recycling be improved? Name two proposals.`,
      `a) purchased (paragraph 1)
b) because of (paragraph 2)
c) deal with (paragraph 3)
d) encouraged (paragraph 4)`,
      `a) I think that _______ (efficient) option to decrease fashion-driven pollution is beginning _______ (rent) clothes.
b) Since 2018, people _______ (become) more and more aware _______ the clothing industry environmental impact.
c) In order to change consumer habits _______ are contributing to pollution, new regulations _______ (draw up) two years ago.
d) Complete the following sentence to report what was said. "Were only 2% of used clothes recycled in the country last year?" — The French minister asked _____________________________ .`,
      '"Clothes say a lot about you." Do you agree with this statement? Justify your opinion.',
      "Medio ambiente / Moda",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2021-2022 Martes ──────────────────────────────────────────────────────
  {
    id: 15,
    año: 2022,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: 'Today\'s "Fake News" Used to Be Called Yellow Journalism',
    preguntas: makePreguntas(
      "ing-2122-M-A",
      t2122MA,
      `a) The term "Yellow Journalism" was coined after a comic strip about a boy in a yellow nightshirt, entitled the "Yellow Kid".
b) Joseph Pulitzer has come to be related to one of the most prominent awards given to journalists.`,
      `a) What similarities are there between William Randolph Hearst and Joseph Pulitzer? Mention two.
b) Did Yellow Journalism play a role in the Spanish-American War? Why.`,
      `a) possibly (paragraph 1)
b) questionable (paragraph 3)
c) intense (paragraph 3)
d) key (paragraph 4)`,
      `a) I really think the journalist is biased. I mean, he _______ (give) a wrong perspective of the issue blaming the government! That's _______ (hard) fair, is it?
b) William Randolph Hearst was one of _______ (colorful), influential, and outspoken figures _______ (involve) in activities surrounding the Spanish-American War.
c) Those _______ consume news need to find ways of _______ (determine) if what they're reading is true.
d) Complete the following sentence to report what was said. "Can you check it out in ten minutes?" — She wondered _____________________________ .`,
      "Can social networking sites like Twitter or Instagram be considered news sources? Justify your answer.",
      "Medios / Historia",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 16,
    año: 2022,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Breakfast Radio",
    preguntas: makePreguntas(
      "ing-2122-M-B",
      t2122MB,
      `a) Radio stations around the world apply to participate in Global Breakfast Radio.
b) GBR offers both an auditory and a visual experience.`,
      `a) What is GBR's main goal?
b) Why do they need to continuously supervise the database?`,
      `a) corresponding (paragraph 1)
b) observe (paragraph 2)
c) solved (paragraph 3)
d) huge (paragraph 3)`,
      `a) In the 19th century, German scientist Heinrich Hertz _______ (prove) the existence of radio waves, _______ occur in nature.
b) Guglielmo Marconi, who was born _______ 20th April 1874, invented what he called "the wireless telegraph" while _______ (experiment) in his parents' attic.
c) Marconi used radio waves _______ (transmit) Morse code and the instrument he used became _______ (know) as the radio.
d) Before the 1920s, the radio _______ (use) to contact ships that were out _______ sea.`,
      "Discuss the pros and cons of starting the school day later in the morning.",
      "Tecnología / Comunicación",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2022-2023 Lunes ───────────────────────────────────────────────────────
  {
    id: 17,
    año: 2023,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Who Invented Music?",
    preguntas: makePreguntas(
      "ing-2223-L-A",
      t2223LA,
      `a) Historians have identified the first person who created music.
b) Excavations have contributed to the knowledge of music in ancient times.`,
      `a) Mention two reasons why early humans started to sing.
b) How were jobs in ancient times associated to different musical instruments?`,
      `a) took place (paragraph 1)
b) across (paragraph 1)
c) complete (paragraph 2)
d) put together (paragraph 2)`,
      `a) My father _______ (love) classical music since he was a little boy, but he is not very keen _______ rock or pop.
b) If I _______ (know) so many people were going to the concert, I _______ (not/buy) tickets three months ago.
c) He was being so _______ (noise) that he was asked to stop _______ (play) the drums.
d) Complete the following sentence to report what was said. "What songs did you use to listen to when you were a child?" — He asked me _____________________________ .`,
      "What are the benefits of music in today's world? Discuss.",
      "Historia / Música",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales","comparativos-y-superlativos","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 18,
    año: 2023,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "How Global Warming is Cutting Sleep Across the World",
    preguntas: makePreguntas(
      "ing-2223-L-B",
      t2223LB,
      `a) A lack of sleep might affect a person's capacity to focus.
b) By the end of this century, people will probably sleep longer than now.`,
      `a) According to the study, how do age and gender interfere in sleep loss?
b) Mention two reasons why air conditioning is not a proper solution.`,
      `a) but (paragraph 1)
b) calculate (paragraph 2)
c) quantity (paragraph 3)
d) seem (paragraph 3)`,
      `a) Talking _______ your problems is a good way _______ (solve) them.
b) The company _______ sold the product explained how to use it _______ (correct).
c) If people _______ (care) about climate change in the past, we _______ (not/need) to take such drastic measures now.
d) Complete the following sentence to report what was said. "Are you going to the museum next Friday?" — He asked Mary _____________________________ .`,
      "Describe the worst or the best dream you have ever had.",
      "Medio ambiente / Salud",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },

  // ── 2022-2023 Martes ──────────────────────────────────────────────────────
  {
    id: 19,
    año: 2023,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Theatre Audience Etiquette",
    preguntas: makePreguntas(
      "ing-2223-M-A",
      t2223MA,
      `a) In Shakespeare's times, theatre viewers were forbidden to eat during performances.
b) Theatre audiences today have easy access to information on how to behave properly.`,
      `a) Which two changes did Mr. Garrick implement in his theatre?
b) What did Patti Lupone do during the performance in 2015?`,
      `a) linked (paragraph 1)
b) often (paragraph 1)
c) supervise (paragraph 1)
d) irritated (paragraph 2)`,
      `a) The performers acted _______ (incredible) well, despite not having rehearsed _______ several months.
b) If I _______ (take) drama classes as a child, I _______ (be) a reasonable actress now.
c) Little babies are fond _______ classical music, _______ has a relaxing effect on them.
d) Complete the following sentence to report what was said. "What is your favourite show?" — He asked him _____________________________ .`,
      "Would you like to participate in a TV show? Justify your answer.",
      "Cultura / Comportamiento social",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 20,
    año: 2023,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Risks of Ultra-processed Foods",
    preguntas: makePreguntas(
      "ing-2223-M-B",
      t2223MB,
      `a) Sweetened yogurts are healthy.
b) People around the world are consuming fewer ultra-processed foods than in the past.`,
      `a) How do ultra-processed foods affect our life expectancy? Explain your answer.
b) Which two effects does eating homemade food have in our bodies?`,
      `a) range (paragraph 2)
b) attractive (paragraph 2)
c) respond (paragraph 4)
d) opposite (paragraph 4)`,
      `a) According _______ recent investigations, eating fruit and vegetables reduces the risk of _______ (suffer) cancer.
b) Food companies _______ (rare) think about how they could make their products _______ (good) than those produced by their competitors.
c) If I _______ (know) that this pizza had so much salt, I _______ (not/buy) it when I went to the supermarket yesterday.
d) People _______ diet includes oily fish and vegetables _______ least once a week have lower rates of diabetes.`,
      "Discuss how people's eating habits could be improved in our society.",
      "Salud / Nutrición",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2023-2024 Lunes ───────────────────────────────────────────────────────
  {
    id: 21,
    año: 2024,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "How a Child Lives the Present",
    preguntas: makePreguntas(
      "ing-2324-L-A",
      t2324LA,
      `a) Geese were the only birds living in the pond when Jason and his grandfather visited the park.
b) Jason could easily chat with other kids about anything.`,
      `a) What was the grandfather's aim when he took Jason to the park?
b) What was not important for Jason about people? Mention two aspects.`,
      `a) amazement (paragraph 2)
b) continuous (paragraph 3)
c) soil (paragraph 3)
d) grass (paragraph 4)`,
      `a) Jason's grandfather suggested _______ (go) to the park because he takes pleasure _______ watching nature.
b) If we _______ (not feed) the ducks every day, they will fly away _______ another park.
c) I _______ (live) here in the woods for five years now. _______, I don't like wild animals.
d) Complete the following sentence to report what was said. Maggie: "I've never wanted to live in this big city." — Maggie said _____________________________ .`,
      "Discuss the advantages and disadvantages of living in the countryside.",
      "Familia / Naturaleza",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 22,
    año: 2024,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Lunes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Is Artificial Intelligence Transforming Education?",
    preguntas: makePreguntas(
      "ing-2324-L-B",
      t2324LB,
      `a) Not one single piece of research has addressed the effects of AI on our civilization.
b) Data analysis will facilitate the development of innovative learning instruments for each student.`,
      `a) How will Artificial Intelligence benefit advanced students?
b) Will teachers be replaced by technology in the future? Explain why.`,
      `a) future (paragraph 1)
b) key (paragraph 1)
c) vanish (paragraph 2)
d) path (paragraph 2)`,
      `a) The computer _______ (reboot) yesterday by a technician. Previously, it had been out _______ order for a full week.
b) In the future, I'd rather _______ (use) my creativity _______ Artificial Intelligence applications.
c) If I _______ (have) time to develop new algorithms in the 1990s, I _______ (become) a millionaire many years ago.
d) Rachel is the one _______ took the decision to create a new AI enterprise _______ her own.`,
      "Explain the pros and cons of using Artificial Intelligence as a student.",
      "Tecnología / Educación",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2023-2024 Martes ──────────────────────────────────────────────────────
  {
    id: 23,
    año: 2024,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Women Engineers",
    preguntas: makePreguntas(
      "ing-2324-M-A",
      t2324MA,
      `a) Ms West had to invest a lot of money in her studies at university.
b) The computer scientist suffered from inattention and had difficulties with social interaction.`,
      `a) What social causes is Ms. Croak fighting for?
b) What do these three women have in common?`,
      `a) precise (paragraph 1)
b) foundation (paragraph 1)
c) kit (paragraph 2)
d) motionless (paragraph 3)`,
      `a) I am looking forward to _______ (visit) the new facilities _______ were built at the airport last winter.
b) Some older people are not aware _______ how technologies _______ (change) the world lately.
c) After _______ (work) for a decade in New York, Mary _______ (offer) a chance to work for NASA last year.
d) We _______ (be) more in touch with nature if we weren't surrounded by _______ (technology) devices.`,
      "Do you think that we depend too much on technology? Justify your answer.",
      "Ciencia / Mujeres",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 24,
    año: 2024,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    dia: "Martes",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Does Chicken Soup Really Help when You're Sick?",
    preguntas: makePreguntas(
      "ing-2324-M-B",
      t2324MB,
      `a) Chicken soup is a recent remedy for illness.
b) When we are ill, the taste of chicken soup makes us feel hungry.`,
      `a) Which two characteristics make chicken soup well liked?
b) Why do people with a respiratory disease stop eating?`,
      `a) really (paragraph 1)
b) meaningful (paragraph 3)
c) treatment (paragraph 4)
d) possible (paragraph 4)`,
      `a) _______ (speak) English will help you find a job when you _______ (grow up).
b) Mary _______ (go) shopping and found _______ (good) offers than me.
c) _______ John nor Paul can cook a tasty meal _______ pressure.
d) Complete the following sentence to report what was said. "Did you like chicken soup when you were a child?," she asked me. — She asked me _____________________________ .`,
      "Describe and justify what a healthy diet is for you.",
      "Salud / Tradiciones",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },

  // ── 2024-2025 9:30h ───────────────────────────────────────────────────────
  {
    id: 25,
    año: 2025,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "Única",
    dia: "9:30",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Magic of Train Travel",
    preguntas: [
      {
        id: "ing-2425-A-1",
        topicSlugs: ["comprension-verdadero-falso-con-evidencia-textual"],
        numero: 1,
        bloque: "Q1",
        label: "True / False / Not Given",
        tema: "Viajes / Cultura",
        puntuacion: 2,
        enunciado: `Indicate whether TWO of the following statements are True, False or the information is Not Given in the text (T/F/NG). In true and false cases, copy the complete sentence that contains the evidence which justifies your answer. No marks are given for only TRUE or FALSE.
a) Means of transport for travelling long distances were dangerous until trains were introduced.
b) When you travel by rail, you have the time to get used to the new places you visit.
c) People like to wonder about other passengers' lives on the train.`,
        criterios: crit1_ng,
        texto_fuente: t2425A,
      },
      {
        id: "ing-2425-A-2",
        topicSlugs: ["comprension-abierta-con-propias-palabras"],
        numero: 2,
        bloque: "Q2",
        label: "Comprensión abierta",
        tema: "Viajes / Cultura",
        puntuacion: 2,
        enunciado: `In your own words and based on the ideas in the text, answer the following questions. Do not copy from the text.
a) In the early days, how were trains transformed to make travel more enjoyable? Include two ideas.
b) Give two reasons why fast trains have taken away some of the charm of railway travel.`,
        criterios: crit2,
        texto_fuente: t2425A,
      },
      {
        id: "ing-2425-A-3",
        topicSlugs: ["vocabulario-en-contexto"],
        numero: 3,
        bloque: "Q3",
        label: "Vocabulario",
        tema: "Viajes / Cultura",
        puntuacion: 1,
        enunciado: `Find the words in the text that mean:
a) much (paragraph 2)
b) joy (paragraph 3)
c) give (paragraph 3)
d) unexpected (paragraph 5)`,
        criterios: crit3,
        texto_fuente: t2425A,
      },
      {
        id: "ing-2425-A-4",
        topicSlugs: ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
        numero: 4,
        bloque: "Q4",
        label: "Gramática (elige 4 de 6)",
        tema: "Viajes / Cultura",
        puntuacion: 2,
        enunciado: `Answer FOUR questions (from a to f) of your choice. Write a new sentence that has the same meaning as the one given. Use the word or expression in brackets. Do not change the word(s) given.
a) It was a bad idea for me to miss yesterday's class. (should)
b) I'm excited about going on that train trip. (forward)
c) We haven't got any more wrapping paper. (run)
d) She was the best candidate, but she didn't get the job. (Although)
Complete the following sentences to report what was said.
e) "Why don't we go to that new sushi bar for lunch tomorrow?" — She suggested … .
f) "Yes, I broke this vase yesterday." — Sue admitted … .`,
        criterios: crit4_new,
        texto_fuente: t2425A,
      },
      {
        id: "ing-2425-A-5",
        topicSlugs: ["redaccion-ensayo-de-opinion","redaccion-carta-o-email-informal"],
        numero: 5,
        bloque: "Q5",
        label: "Redacción (elige 1 de 2)",
        tema: "Viajes / Cultura",
        puntuacion: 3,
        enunciado: `Write between 150 and 200 words on ONE of the following questions.
a) Some people complain about the transport system in big cities and think it should be improved. Do you agree? Justify your answer.
b) Write an informal e-mail to your American friend Susan asking for advice about a trip you are planning to the USA.
Remember: DO NOT SIGN OR IDENTIFY YOUR EMAIL.`,
        criterios: crit5_new,
      },
    ],
  },

  // ── 2024-2025 12:00h ──────────────────────────────────────────────────────
  {
    id: 26,
    año: 2025,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "Única",
    dia: "12:00",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Home Education: the Right Choice?",
    preguntas: [
      {
        id: "ing-2425-B-1",
        topicSlugs: ["comprension-verdadero-falso-con-evidencia-textual"],
        numero: 1,
        bloque: "Q1",
        label: "True / False / Not Given",
        tema: "Educación / Sociedad",
        puntuacion: 2,
        enunciado: `Indicate whether TWO of the following statements are True, False or the information is Not Given in the text (T/F/NG). In true and false cases, copy the complete sentence that contains the evidence which justifies your answer. No marks are given for only TRUE or FALSE.
a) Home education has become increasingly unpopular in the last decade.
b) In flexi-schooling, pupils learn using electronic devices as well as traditional textbooks.
c) One of the reasons why parents choose home schooling is that they can select the learning contents themselves.`,
        criterios: crit1_ng,
        texto_fuente: t2425B,
      },
      {
        id: "ing-2425-B-2",
        topicSlugs: ["comprension-abierta-con-propias-palabras"],
        numero: 2,
        bloque: "Q2",
        label: "Comprensión abierta",
        tema: "Educación / Sociedad",
        puntuacion: 2,
        enunciado: `In your own words and based on the ideas in the text, answer the following questions. Do not copy from the text.
a) What do parents need to do if they want to home educate their children who are already going to a traditional school?
b) How are more people getting to know better about home schooling?`,
        criterios: crit2,
        texto_fuente: t2425B,
      },
      {
        id: "ing-2425-B-3",
        topicSlugs: ["vocabulario-en-contexto"],
        numero: 3,
        bloque: "Q3",
        label: "Vocabulario",
        tema: "Educación / Sociedad",
        puntuacion: 1,
        enunciado: `Find the words in the text that mean:
a) obligation (paragraph 1)
b) route (paragraph 2)
c) concentrate (paragraph 3)
d) convenient (paragraph 3)`,
        criterios: crit3,
        texto_fuente: t2425B,
      },
      {
        id: "ing-2425-B-4",
        topicSlugs: ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
        numero: 4,
        bloque: "Q4",
        label: "Gramática (elige 4 de 6)",
        tema: "Educación / Sociedad",
        puntuacion: 2,
        enunciado: `Answer FOUR questions (from a to f) of your choice. Write a new sentence that has the same meaning as the one given. Use the word or expression in brackets. Do not change the word(s) given.
a) I didn't know John wanted to come to the party, so I didn't invite him. (if)
b) I started playing the piano three years ago. (for)
c) Although the restaurant was crowded, we managed to find a table. (In spite of)
Complete the following sentences to report what was said.
d) "Why don't we get another assistant for the job?" — Jim suggested … .
e) "Do you really need to use your phone at this moment?" — My dad asked me … .
Rephrase the sentence beginning with the words given.
f) "The students in this group are making a huge effort to get the highest marks this year." — A huge effort … .`,
        criterios: crit4_new,
        texto_fuente: t2425B,
      },
      {
        id: "ing-2425-B-5",
        topicSlugs: ["redaccion-ensayo-de-opinion","redaccion-carta-o-email-informal"],
        numero: 5,
        bloque: "Q5",
        label: "Redacción (elige 1 de 2)",
        tema: "Educación / Sociedad",
        puntuacion: 3,
        enunciado: `Write between 150 and 200 words on ONE of the following questions.
a) What are the advantages and disadvantages of taking online lessons? Discuss.
b) Your friend Susan, who will be going to university next year, has sent you an e-mail asking for your opinion on whether she should study in her home country or abroad instead. Reply with an informal e-mail giving your advice.
Remember: DO NOT SIGN OR IDENTIFY YOUR EMAIL.`,
        criterios: crit5_new,
      },
    ],
  },
  // ── 2020-2021 Extraordinaria ──────────────────────────────────────────────
  {
    id: 27,
    año: 2021,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "TikTok, a Social Media Sensation",
    preguntas: makePreguntas(
      "ing-2021Ext-A",
      t2021ExtA,
      `a) Most people watching TikTok videos are adults.
b) Becoming famous exclusively depends on the number of fans you have.`,
      `a) What is the usual content of TikTok videos?
b) In which two ways does Felicity take advantage of TikTok?`,
      `a) almost (paragraph 1)
b) trapped (paragraph 2)
c) previous (paragraph 3)
d) possibility (paragraph 3)`,
      `a) Research ________ (show) that apps ________ (use) by millions of people in the last ten years.
b) ________ TikTok is very well known, the most popular site ________ sharing videos is YouTube.
c) The ________ (funny) a video is, the ________ (high) number of likes it gets.
d) Complete the following sentence to report what was said.
"When did you discover social media for the first time?"
He asked me ___________________________________________________________.`,
      "Discuss the advantages and disadvantages of using social media.",
      "Redes sociales / Entretenimiento",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","voz-pasiva","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 28,
    año: 2021,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Gap Years for Every Student",
    preguntas: makePreguntas(
      "ing-2021Ext-B",
      t2021ExtB,
      `a) It is said that taking a gap year does not contribute to students' autonomy and confidence.
b) According to statistics, job opportunities decrease due to taking a gap year.`,
      `a) Mention two kinds of activities students do during their gap year.
b) To what extent does the family income level affect students' opportunities to take a gap year? Explain.`,
      `a) put off (paragraph 1)
b) follow (paragraph 2)
c) influence (paragraph 3)
d) equality (paragraph 4)`,
      `a) I still don't know _______ my career advisor will be _______ Oxford University.
b) Before _______ (start) college, I would like to check if I would be able to live _______ my own.
c) If she had known what she _______ (want) to study, she _______ (complete) a university degree.
d) Only after she _______ (spend) one year working, did she manage _______ (decide) which field she wanted to specialise in.`,
      "What would you like to do if you had the opportunity to take a gap year? Explain.",
      "Educación / Decisiones vitales",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2020-2021 Modelo ──────────────────────────────────────────────────────
  {
    id: 29,
    año: 2021,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Flashes on the Moon",
    preguntas: makePreguntas(
      "ing-2021Mod-A",
      t2021ModA,
      `a) The flashes on the moon happen just once a week.
b) Scientists have been observing moon flashes for almost 50 years.`,
      `a) Mention two theories that could explain this phenomenon.
b) Where is the telescope located? Why?`,
      `a) shine (paragraph 1)
b) happened (paragraph 1)
c) established (paragraph 2)
d) station (paragraph 3)`,
      `a) The Moon is an astronomical body _______ (orbit) the Earth, and we usually see it _______ the night sky.
b) Even though the astronauts' footprints _______ (leave) on the moon a long time ago, it is likely that they are _______ there.
c) China _______ (start) a comprehensive lunar program and _______ the beginning of January 2019 launched a probe on the far side of the moon.
d) The Moon, _______ goes around the Earth, _______ (cover) in rocks.`,
      "You have the chance to be the first student astronaut to explore another planet. Would you accept the job? Give reasons why or why not.",
      "Ciencia / Espacio",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 30,
    año: 2021,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Is Reading Affected by Gender?",
    preguntas: makePreguntas(
      "ing-2021Mod-B",
      t2021ModB,
      `a) The participants in the study were asked how good they were at reading.
b) Both researchers are certain their results are totally reliable.`,
      `a) What results did the study reveal with regard to boys? Mention two things.
b) What did the other study described in the text find out?`,
      `a) carry out (paragraph 1)
b) showed (paragraph 2)
c) seem (paragraph 2)
d) differences (paragraph 3)`,
      `a) My favourite teacher always believed in _______ (treat) all her students exactly the same, regardless _______ their gender.
b) His sister has always been better _______ languages _______ at maths.
c) One of the researchers, _______ is also a psychologist, pointed _______ that they need more data before reaching solid conclusions.
d) Complete the following sentence to report what was said.
"What is your favourite book?"
My friend asked me______________________________________________________.`,
      "What is your favourite book? Describe it and say why you like it so much.",
      "Educación / Género",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },

  // ── 2021-2022 Extraordinaria ──────────────────────────────────────────────
  {
    id: 31,
    año: 2022,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Can our Bodies Withstand Global Heating?",
    preguntas: makePreguntas(
      "ing-2122Ext-A",
      t2122ExtA,
      `a) Extremely high temperatures affect both cars and human bodies in similar ways.
b) The hypothalamus is the only human organ that senses body temperature.`,
      `a) Name two responses of the human brain to overheating.
b) According to the text, who will most probably suffer the consequences of high temperatures?`,
      `a) gains control of (paragraph 1)
b) deadly (paragraph 2)
c) everlasting (paragraph 2)
d) intolerable (paragraph 3)`,
      `a) If she ________ (not / exercise) in such hot weather yesterday, she ________ (not / get) sunstroke.
b) Kidneys, ________ are responsible ________ regulating the concentrations of water and salts in blood, may be damaged by extremely high temperatures.
c) Nearly 300,000 people ________ (diagnose) with skin cancer every year. ________, sunbathing is still a very popular activity.
d) Complete the following sentence to report what was said.
"Which steps do we have to take to stop global warming?"
In 2015 the WHO asked them _____________________________________________________.`,
      "Some people prefer to live in hot climates whereas others prefer the cold ones. Discuss both views and give your opinion.",
      "Clima / Salud",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 32,
    año: 2022,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Rise of the 'Granfluencer'",
    preguntas: makePreguntas(
      "ing-2122Ext-B",
      t2122ExtB,
      `a) Statistics show that the number of over 65s who use social media has decreased in the last years.
b) Granfluencers are only popular among the elderly.`,
      `a) What kind of non-profit activities are granfluencers interested in?
b) What is the extra plus of a granfluencer if compared to a "regular" influencer?`,
      `a) error (paragraph 1)
b) extended (paragraph 1)
c) getting pleasure from (paragraph 3)
d) increasing (paragraph 3)`,
      `a) A study that _______ (publish) last month found that our level of self-esteem depends on how _______ (social) accepted we feel.
b) People who _______ (be) interested in beauty and fashion use social media to keep up _______ the latest news.
c) I wish the Internet _______ (have) more educational content, but this is something hard _______ (find) these days.
d) If I _______ (become) a social media influencer years ago, I _______ (be) a wealthy person now.`,
      "Does technology make older people's lives better? Justify your answer.",
      "Redes sociales / Tercera edad",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2021-2022 Modelo ──────────────────────────────────────────────────────
  {
    id: 33,
    año: 2022,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Future of Jobs and Skills",
    preguntas: makePreguntas(
      "ing-2122Mod-A",
      t2122ModA,
      `a) What we study today will be relevant for our future profession.
b) According to research, over three quarters of workers will have to upgrade their abilities.`,
      `a) What's the historical relationship between technology and jobs?
b) How is climate change affecting jobs?`,
      `a) emerged (paragraph 2)
b) nowadays (paragraph 3)
c) keep (paragraph 4)
d) look after (paragraph 4)`,
      `a) Throughout centuries, people _______ (be) afraid of changes, _______ are totally necessary for our progress.
b) To improve employability, workers need to focus on _______ (learn) new skills that differentiate them _______ robots.
c) Courses dealing _______ interpersonal skills are becoming increasingly popular because they are not _______ interesting but also useful for job seekers.
d) Complete the following sentence to report what was said.
"Did the number of jobs in the green sector increase last year?"
Advisors asked _________________________________________________________.`,
      "Do you think there are jobs more suitable for robots than for humans? Discuss.",
      "Trabajo / Tecnología",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 34,
    año: 2022,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Social Media and Mental Health",
    preguntas: makePreguntas(
      "ing-2122Mod-B",
      t2122ModB,
      `a) Instagram photos are likely to make people feel inferior.
b) According to Dr Bono, excessive focus on taking the best pictures helps to enjoy life experiences.`,
      `a) How can social media negatively affect your memories?
b) What do statistics say about social media and Generation Z?`,
      `a) growth (paragraph 1)
b) dependence (paragraph 1)
c) took place (paragraph 2)
d) demonstrated (paragraph 3)`,
      `a) _______ more people overuse social media, the _______ (unhappy) they can feel.
b) The best way to protect yourself _______ the dangers of social media is by _______ (not/provide) personal information.
c) He is very active on Twitter, _______ many politicians see now _______ the best platform for communication.
d) Complete the following sentence to report what is said:
"Enjoy every aspect of your life in real time", said Dr Bono.
Dr Bono tells us __________________________________________________________.`,
      "How have social media changed the way we live? Discuss.",
      "Redes sociales / Salud mental",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2022-2023 Extraordinaria ──────────────────────────────────────────────
  {
    id: 35,
    año: 2023,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Origin of Chess",
    preguntas: makePreguntas(
      "ing-2223Ext-A",
      t2223ExtA,
      `a) Unlike chess, most games don't stand the test of time.
b) The majority of history experts don't believe that chess comes from India.`,
      `a) How did The Queen's Gambit series influence chess?
b) What was Ricardo Calvo's theory about where chess originated?`,
      `a) inhabitants (paragraph 1)
b) gave (paragraph 2)
c) proof (paragraph 3)
d) wealthy (paragraph 3)`,
      `a) He ordered Jim to switch _______ the TV because the news was about _______ (start).
b) My favourite cinema director made a film 3 years _______, but this year he _______ (not/release) anything yet.
c) John _______ (strong) disagrees with me about _______ the best chess player is.
d) Complete the following sentence to report what was said.
"Minecraft is the most boring videogame I've ever played."
Robert told me _______________________________________________________________.`,
      "What kind of board games do you like the most? Justify your answer.",
      "Juegos / Ocio",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 36,
    año: 2023,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Case against Energy Drinks is Getting Stronger",
    preguntas: makePreguntas(
      "ing-2223Ext-B",
      t2223ExtB,
      `a) Teenagers who participated in the survey felt that taking energy drinks improved their sports performance.
b) Until scientific evidence shows they are safe, power drinks advertising should be restricted.`,
      `a) What was the aim of the research published by the Pediatric Emergency Care?
b) According to the companies, what are the two effects of drinking energy drinks?`,
      `a) trouble (paragraph 2)
b) suitable (paragraph 3)
c) connection (paragraph 4)
d) negative (paragraph 4)`,
      `a) So far, research _______ (not / prove) that some foods and drinks are _______ (harm) to your health.
b) Tea _______ (bring) to Britain in the early 17th century _______ a private company.
c) When _______ (decide) your child's diet, _______ (good) method is following the doctor's advice.
d) Complete the following sentence to report what was said.
"Do you enjoy drinking coffee after your dinner?"
He asked me ________________________________________________________________.`,
      "Do you think that your present eating habits will affect your future health? Justify your answer.",
      "Salud / Alimentación",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2022-2023 Modelo ──────────────────────────────────────────────────────
  {
    id: 37,
    año: 2023,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Why is Bangkok the Most Visited City in the World?",
    preguntas: makePreguntas(
      "ing-2223Mod-A",
      t2223ModA,
      `a) Bangkok is the writer's favourite destination to go on vacation.
b) Thailand is the cheapest country in the world.`,
      `a) How do locals contribute to Bangkok's cleanliness?
b) Why do tourists decide to start their trips in South East Asia from Bangkok?`,
      `a) approximate (paragraph 2)
b) around (paragraph 2)
c) waste (paragraph 3)
d) problems (paragraph 4)`,
      `a) Finding _______ (accommodate) in a big city requires _______ (book) months in advance.
b) Your Thailand costs will vary ________ (great) depending ________ the kind of traveler you want to be.
c) If you ________(choose) a different airline last year, your trip ________(not / be) so expensive.
d) You probably already know how ______ (say) "hello" in Japanese, but in case you don't, this is one of _______ (easy) words you can learn.`,
      "Discuss the advantages and disadvantages of travelling to exotic destinations.",
      "Viajes / Turismo",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 38,
    año: 2023,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Sports in America",
    preguntas: makePreguntas(
      "ing-2223Mod-B",
      t2223ModB,
      `a) Female participation in school sports is now higher than three decades ago.
b) Being good at a sport is the only requirement to get a grant.`,
      `a) What benefits do teenagers get from playing sports? Mention two.
b) According to the text, is the number of scholarships different for boys and girls? Why?`,
      `a) chance (paragraph 1)
b) significant (paragraph 2)
c) comprise (paragraph 2)
d) key (paragraph 4)`,
      `a) Young players, _______ frequently play school sports, acquire values by _______ (compete) while in school.
b) Every year, outdoor sports _______ (play) all through the academic course _______ (regard) of the weather conditions.
c) Failing _______ (meet) the graduation requirements may prevent you _______ getting into university.
d) Complete the following sentence to report what was said.
"Who won the Australia Open tournament three years ago?"
My son asked me _____________________________________________________________.`,
      "Do you consider that practicing sports is absolutely necessary for a healthy life? Explain.",
      "Deporte / Educación",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2023-2024 Extraordinaria ──────────────────────────────────────────────
  {
    id: 39,
    año: 2024,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "World's Deepest Hotel",
    preguntas: makePreguntas(
      "ing-2324Ext-A",
      t2324ExtA,
      `a) Deep Sleep was specifically excavated to serve for lodging.
b) You can descend to the hotel even if you are afraid.`,
      `a) What is the safety equipment provided to go down to Deep Sleep?
b) Mention two ways in which you can enjoy this adventure.`,
      `a) ground (paragraph 1)
b) special (paragraph 1)
c) includes (paragraph 1)
d) ascent (paragraph 2)`,
      `a) In Deep Sleep, you are prevented ______ approaching other caves by signs ______ the walls.
b) ______ (visit) to the mine should consider ______ (bring) warm clothes.
c) If I ______ (have) the money for such an adventure in 1993, I ______ (undertake) that expedition in 1998.
d) Complete the following sentence to report what was said.
"I can't go to the expedition with my friends."
Joanna apologized because______________________________________________________.`,
      "Explain the pros and cons of adventure holidays.",
      "Viajes / Aventura",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 40,
    año: 2024,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "What Air Pollution Does to our Lungs",
    preguntas: makePreguntas(
      "ing-2324Ext-B",
      t2324ExtB,
      `a) Severe weather conditions cause more deaths than air pollution.
b) Having cleaner transport options saves lives.`,
      `a) What did Dr. Neira use last Cop28 summit for?
b) What consequences does air pollution have on our health?`,
      `a) prepared (paragraph 1)
b) means (paragraph 3)
c) change (paragraph 4)
d) encourage (paragraph 4)`,
      `a) She is a politician _______ has an excellent capacity to create new rules. However, she is _______ (able) to develop traffic control regulations.
b) The _______ (health) my diet is, the stronger I feel whenever I need _______ (make) an effort.
c) Normally it _______ (think) that using the train is less polluting than driving because _______ the reduction in gas emissions.
d) Sam, would you mind _______ (finish) the report now? It's terribly late, and this is a very _______ (stress) situation.`,
      "Do you think that only governments can do something to limit pollution or that individuals can contribute too? Justify your opinion.",
      "Medio ambiente / Salud",
      ["gramatica-transformacion-y-uso-de-estructuras","comparativos-y-superlativos","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2023-2024 Modelo ──────────────────────────────────────────────────────
  {
    id: 41,
    año: 2024,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Nobel Prize for Studying Neanderthal DNA",
    preguntas: makePreguntas(
      "ing-2324Mod-A",
      t2324ModA,
      `a) Pääbo studies have only been focused on Neanderthals.
b) Pääbo was sure he would win the Nobel Prize with this research.`,
      `a) Why are Pääbo's discoveries important for other researchers?
b) How much is the prize and where does the money come from?`,
      `a) clever (paragraph 1)
b) findings (paragraph 3)
c) occasion (paragraph 3)
d) excellent (paragraph 4)`,
      `a) If he _______ (be) a science researcher nowadays, his studies would deal _______ DNA.
b) Since 2012, developments in chemistry _______ (lead) to innovative options in the energy sector, _______ big changes are needed.
c) _______ the sale price was incredibly high, they managed _______ (sell) their summer home in only one month
d) Complete the following sentence to report what was said.
"Did any researcher from your country win a Nobel Prize?"
He asked me _________________________________________________________________.`,
      "Which inventions do you think have significantly changed the world? Discuss.",
      "Ciencia / Historia",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 42,
    año: 2024,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "TikTok's Rise",
    preguntas: makePreguntas(
      "ing-2324Mod-B",
      t2324ModB,
      `a) TikTok will become the second most watched social media by the end of this year.
b) TikTok's algorithm is crucial for the app's widespread popularity.`,
      `a) How did Covid-19 affect the use of TikTok?
b) What are the main worries about using TikTok and other social media excessively?`,
      `a) specialists (paragraph 1)
b) around (paragraph 1)
c) started (paragraph 2)
d) almost (paragraph 2)`,
      `a) TikTok was the top app _______ (global) in the second quarter of 2020, because it is _______ (easy) to use than others.
b) By 2025, ads on TikTok _______ (reach) 30% of internet users _______ are aged above 18.
c) TikTok is an international version of Douyin, which _______ (release) in the Chinese market seven years _______.
d) Facebook has stopped _______ (be) the most downloaded app since TikTok appeared _______ 6th September 2016.`,
      "What is your opinion about the impact of social media on society? Justify your answer.",
      "Redes sociales / Sociedad",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2024-2025 Extraordinaria ──────────────────────────────────────────────
  {
    id: 43,
    año: 2025,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "Única",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Would You Eat Insects?",
    preguntas: [
      {
        id: "ing-2425Ext-1",
        topicSlugs: ["comprension-verdadero-falso-con-evidencia-textual"],
        numero: 1,
        bloque: "Q1",
        label: "True / False / Not Given",
        tema: "Alimentación / Medio ambiente",
        puntuacion: 2,
        enunciado: `Indicate whether TWO of the following statements are True, False or the information is Not Given in the text (T/F/NG). In true and false cases, copy the complete sentence that contains the evidence which justifies your answer. No marks are given for only TRUE or FALSE.
a) An important institution has emphasized the relevance of using insects to combat food problems in a world with more and more people.
b) Research has shown that feelings of disgust are associated with eating insects in most Western countries.
c) Bugs have only recently been included as part of human diets.`,
        criterios: crit1_ng,
        texto_fuente: t2425ExtU,
      },
      {
        id: "ing-2425Ext-2",
        topicSlugs: ["comprension-abierta-con-propias-palabras"],
        numero: 2,
        bloque: "Q2",
        label: "Comprensión abierta",
        tema: "Alimentación / Medio ambiente",
        puntuacion: 2,
        enunciado: `In your own words and based on the ideas in the text, answer the following questions. Do not copy from the text.
a) Name two negative responses that Joseph Yoon's cooking has provoked from certain people.
b) What type of activities does Yoon do to promote insect eating? Mention two.`,
        criterios: crit2,
        texto_fuente: t2425ExtU,
      },
      {
        id: "ing-2425Ext-3",
        topicSlugs: ["vocabulario-en-contexto"],
        numero: 3,
        bloque: "Q3",
        label: "Vocabulario",
        tema: "Alimentación / Medio ambiente",
        puntuacion: 1,
        enunciado: `Find the words in the text that mean:
a) famous (paragraph 1)
b) aim (paragraph 2)
c) quantity (paragraph 3)
d) strategy (paragraph 4)`,
        criterios: crit3,
        texto_fuente: t2425ExtU,
      },
      {
        id: "ing-2425Ext-4",
        topicSlugs: ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales","comparativos-y-superlativos"],
        numero: 4,
        bloque: "Q4",
        label: "Gramática (elige 4 de 6)",
        tema: "Alimentación / Medio ambiente",
        puntuacion: 2,
        enunciado: `Answer FOUR questions (from a to f) of your choice. Write a new sentence that has the same meaning as the one given. Use the word or expression in brackets. Do not change the word(s) given.
a) Clothes are much cheaper than they were a few years ago. (used).
b) The museum was less interesting than I expected. (as)
c) I advise you to go to the dentist at least once a year. (had better)
d) John is so healthy because he eats lots of fruit and vegetables. (if)
Complete the following sentence to report what was said.
e) "What else did you see?"
I asked the little girl … .
Rephrase the sentence beginning with the words given.
f) "People are spending more money on video games now than they spent ten years ago."
More money … .`,
        criterios: crit4_new,
        texto_fuente: t2425ExtU,
      },
      {
        id: "ing-2425Ext-5",
        topicSlugs: ["redaccion-ensayo-de-opinion"],
        numero: 5,
        bloque: "Q5",
        label: "Redacción (elige 1 de 2)",
        tema: "Alimentación / Medio ambiente",
        puntuacion: 3,
        enunciado: `Write between 150 and 200 words on ONE of the following questions.
a) Some people prefer to eat at restaurants or pre-made meals. Other people prefer to prepare and eat food at home. Which one do you prefer? Justify your answer.
b) Describe a negative experience you have had when eating out.`,
        criterios: crit5_new,
      },
    ],
  },

  // ── 2024-2025 Modelo ──────────────────────────────────────────────────────
  {
    id: 44,
    año: 2025,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "Única",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Breath Meditation: A Great Way to Relieve Stress",
    preguntas: [
      {
        id: "ing-2425Mod-1",
        topicSlugs: ["comprension-verdadero-falso-con-evidencia-textual"],
        numero: 1,
        bloque: "Q1",
        label: "True / False / Not Given",
        tema: "Salud / Bienestar",
        puntuacion: 2,
        enunciado: `Indicate whether TWO of the following statements are True, False or the information is Not Given in the text (T/F/NG). In true and false cases, copy the complete sentence that contains the evidence which justifies your answer. No marks are given for only TRUE or FALSE.
a) Only experienced meditators can relax by focusing on breathing.
b) Listening to music while practicing breathing exercises is becoming very popular.
c) The practice of mindfulness requires deliberate observation of the here and now without forming particular opinions.`,
        criterios: crit1_ng,
        texto_fuente: t2425ModU,
      },
      {
        id: "ing-2425Mod-2",
        topicSlugs: ["comprension-abierta-con-propias-palabras"],
        numero: 2,
        bloque: "Q2",
        label: "Comprensión abierta",
        tema: "Salud / Bienestar",
        puntuacion: 2,
        enunciado: `In your own words and based on the ideas in the text, answer the following questions. Do not copy from the text.
a) Explain two negative consequences of stress on health.
b) Why do people start practicing mindfulness and what is the result of that practice?`,
        criterios: crit2,
        texto_fuente: t2425ModU,
      },
      {
        id: "ing-2425Mod-3",
        topicSlugs: ["vocabulario-en-contexto"],
        numero: 3,
        bloque: "Q3",
        label: "Vocabulario",
        tema: "Salud / Bienestar",
        puntuacion: 1,
        enunciado: `Find the words in the text that mean:
a) terrible (paragraph 1)
b) wish (paragraph 2)
c) door (paragraph 3)
d) emerge (paragraph 4)`,
        criterios: crit3,
        texto_fuente: t2425ModU,
      },
      {
        id: "ing-2425Mod-4",
        topicSlugs: ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
        numero: 4,
        bloque: "Q4",
        label: "Gramática (elige 4 de 6)",
        tema: "Salud / Bienestar",
        puntuacion: 2,
        enunciado: `Answer FOUR questions (from a to f) of your choice. Write a new sentence that has the same meaning as the one given. Use the word or expression in brackets. Do not change the word(s) given.
a) I should have started working on the project last month. (if only)
b) When I play football, I feel very happy. (makes)
c) "I won't go to that boring party," said Nick. (refused)
d) First, David wrote his mother an email, and then he apologised for his behaviour. (after)
Complete the following sentences to report what was said.
e) "What is he going to do to relax?" Sue asked me.
Sue asked me … .
Rephrase the sentence beginning with the words given.
f) They are building a new high-technology hospital in my town.
A new high-technology … .`,
        criterios: crit4_new,
        texto_fuente: t2425ModU,
      },
      {
        id: "ing-2425Mod-5",
        topicSlugs: ["redaccion-ensayo-de-opinion","redaccion-carta-o-email-informal"],
        numero: 5,
        bloque: "Q5",
        label: "Redacción (elige 1 de 2)",
        tema: "Salud / Bienestar",
        puntuacion: 3,
        enunciado: `Write between 150 and 200 words on ONE of the following questions.
a) Should physical education be mandatory in secondary schools? Justify your answer.
b) Write an informal e-mail to an English friend about something positive and interesting that has happened in your school recently.`,
        criterios: crit5_new,
      },
    ],
  },

  // ── 2025-2026 Modelo ──────────────────────────────────────────────────────
  {
    id: 45,
    año: 2026,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "Única",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Reinvention of an Irish Tourist Town",
    preguntas: [
      {
        id: "ing-2526Mod-1",
        topicSlugs: ["comprension-verdadero-falso-con-evidencia-textual"],
        numero: 1,
        bloque: "Q1",
        label: "True / False / Not Given",
        tema: "Viajes / Sostenibilidad",
        puntuacion: 2,
        enunciado: `Indicate whether TWO of the following statements are True, False or the information is Not Given in the text (T/F/NG). In true and false cases, copy the complete sentence that contains the evidence which justifies your answer. No marks are given for only TRUE or FALSE.
a) Killarney became a major tourist attraction when trains began to run in the nineteenth century and the British monarch went there.
b) Getting to Killarney by train is not convenient because you need to walk to the outskirts to catch the train.
c) American tourists enjoy visiting the beautiful lakes of Killarney.`,
        criterios: crit1_ng,
        texto_fuente: t2526ModU,
      },
      {
        id: "ing-2526Mod-2",
        topicSlugs: ["comprension-abierta-con-propias-palabras"],
        numero: 2,
        bloque: "Q2",
        label: "Comprensión abierta",
        tema: "Viajes / Sostenibilidad",
        puntuacion: 2,
        enunciado: `In your own words and based on the ideas in the text, answer the following questions. Do not copy from the text.
a) Name two problems that arose when Killarney became a popular holiday destination.
b) Describe the green initiative that people in Killarney have introduced for takeaway drinks.`,
        criterios: crit2,
        texto_fuente: t2526ModU,
      },
      {
        id: "ing-2526Mod-3",
        topicSlugs: ["vocabulario-en-contexto"],
        numero: 3,
        bloque: "Q3",
        label: "Vocabulario",
        tema: "Viajes / Sostenibilidad",
        puntuacion: 1,
        enunciado: `Find the words in the text that mean:
a) found (paragraph 1)
b) terrible (paragraph 2)
c) perseverance (paragraph 2)
d) prohibit (paragraph 3)
e) neat (paragraph 3)`,
        criterios: crit3_5items,
        texto_fuente: t2526ModU,
      },
      {
        id: "ing-2526Mod-4",
        topicSlugs: ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech"],
        numero: 4,
        bloque: "Q4",
        label: "Gramática (elige 4 de 6)",
        tema: "Viajes / Sostenibilidad",
        puntuacion: 2,
        enunciado: `Answer FOUR questions (from a to f) of your choice. Write a new sentence that has the same meaning as the one given. Use the word or expression in brackets. Do not change the word(s) given.
a) My sister was too young to travel on her own. (enough)
b) Patrick drove a car for the first time last year. (never)
c) My brother usually sleeps until noon. (used)
d) My teacher said she was sorry she was late for the lesson. (apologised)
Complete the following sentence to report what was said.
e) "When will you be back?"
Peter asked the girl … .
Rephrase the sentence beginning with the words given.
f) "I don't think we need to listen to what she has to say."
There is no point … .`,
        criterios: crit4_new,
        texto_fuente: t2526ModU,
      },
      {
        id: "ing-2526Mod-5",
        topicSlugs: ["redaccion-ensayo-de-opinion","redaccion-carta-o-email-informal"],
        numero: 5,
        bloque: "Q5",
        label: "Redacción (elige 1 de 2)",
        tema: "Viajes / Sostenibilidad",
        puntuacion: 3,
        enunciado: `Write between 140 and 180 words on ONE of the following questions.
a) Many people enjoy hiking in natural environments. Why do you think they do so? Use specific reasons to support your answer.
b) Your foreign friend Tom has only one day to spend in your town or village. Write an informal e-mail to him suggesting some places he should visit and explaining why.`,
        criterios: crit5_new,
      },
    ],
  },

  // ── 2017-2018 Modelo ──────────────────────────────────────────────────────
  {
    id: 46,
    año: 2018,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Selfie Accidents",
    preguntas: makePreguntas(
      "ing-1718Mod-A",
      t1718ModA,
      `a) Deaths linked to selfies more than double those due to dangerous sea animals.
b) It seems that not all deadly accidents caused by selfies have been reported in newspapers.`,
      `a) Why do certain people want to take some shocking selfies?
b) Has anything been done to prevent selfie accidents? Explain.`,
      `a) wish (paragraph 1)
b) take place (paragraph 2)
c) most recent (paragraph 2)
d) brochure (paragraph 3)`,
      `a) We all know some social-media addicts _______ can't avoid _______ (snap) selfies all the time.
b) Recently, young people _______ (create) a new visual language which is understood _______ both sender and recipient.
c) _______ many of us carry our phones almost constantly, the use of the selfie _______ (become) more widespread.
d) Complete the following sentence to report what was said.
Mike told Mary: "I spoke to my publisher about your new photography book."
Mike said ___________________________________________________ .`,
      "Do you think selfie sticks should be banned in some places? Give your opinion.",
      "Redes sociales / Tecnología",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 47,
    año: 2018,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Legend of the Bermuda Triangle",
    preguntas: makePreguntas(
      "ing-1718Mod-B",
      t1718ModB,
      `a) Disappearances in the Bermuda Triangle always occur when there are bad climatic conditions.
b) The reputation of the Bermuda Triangle started centuries ago.`,
      `a) What climatic conditions in the Bermuda Triangle might explain the problems for ships and airplanes?
b) What do insurance companies and researches on the Bermuda Triangle have in common regarding the mystery of the area?`,
      `a) attributed (paragraph 2)
b) dangerous (paragraph 2)
c) countless (paragraph 3)
d) regard (paragraph 3)`,
      `a) _______ many theories were proposed by the scientists, nobody _______ (solve) the mystery yet.
b) _______ has it been _______ the first incidents occurred?
c) If unexplained shipwrecks _______ (not take) place in the area, the region _______ (not call) the Devil's Triangle.
d) Complete the following sentence to report what was said.
John: Did you know that many ships and planes disappeared in the Bermuda Triangle?
He asked us______________________________________________________.`,
      "Describe an experience that made you feel afraid.",
      "Misterios / Naturaleza",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },

  // ── 2017-2018 Extraordinaria ──────────────────────────────────────────────
  {
    id: 48,
    año: 2018,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Saving the British Pub",
    preguntas: makePreguntas(
      "ing-1718Ext-A",
      t1718ExtA,
      `a) George Orwell used to visit his favourite pub every day.
b) Pub closures have been most significant since the beginning of the 21st century.`,
      `a) There are several reasons for pub closures. Mention four.
b) Why is the decline of pubs affecting British people's feelings?`,
      `a) spectacular (paragraph 2)
b) succeed (paragraph 3)
c) actually (paragraph 3)
d) establish (paragraph 4)`,
      `a) People should _______ (encourage) to visit pubs by the government so as _______ close the gap between the price of supermarket and pub booze.
b) _______ smoking is no longer permitted, some people still _______ (enjoy) socialising in pubs.
c) You always come _______ friendly people in local pubs. That's _______ we should try to frequent them.
d) I remember _______ (go) to the pub with my father when I was a child. However, now you are not allowed _______ you are over 18.`,
      "Is it important to save traditions? Give your opinion.",
      "Tradiciones / Sociedad",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 49,
    año: 2018,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Fancy a Lab Grown Burger?",
    preguntas: makePreguntas(
      "ing-1718Ext-B",
      t1718ExtB,
      `a) The University of Maastricht invested a total of a quarter of a million euros from its own budget in the first synthetic burger.
b) It will take some time before the cultured burgers cost as much as regular ones.`,
      `a) Explain how tissue engineering may help biomedical research.
b) What may be the effects of large-scale cultured meat production on global warming?`,
      `a) entire (paragraph 1)
b) subsidised (paragraph 2)
c) fallen (paragraph 2)
d) nowadays (paragraph 2)`,
      `a) I wish scientists _______ (discover) meat culture decades ago! It _______ have spared the planet much irreversible degradation.
b) The first cultured meatball _______ (make) in 2016 by an unknown company _______ manager is a young bio-engineer in her twenties.
c) Some believe that cultured meat is one of _______ (important) discoveries in recent times for _______ (defeat) some world problems.
d) Nowadays, _______ (be) a vegetarian is becoming a far more popular option _______ it used to be a few decades ago.`,
      "Would you like to live in a world with only artificial food? Justify your answer.",
      "Ciencia / Alimentación",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","voz-pasiva","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2018-2019 Modelo ──────────────────────────────────────────────────────
  {
    id: 50,
    año: 2019,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Parents Join Facebook to Spy",
    preguntas: makePreguntas(
      "ing-1819Mod-A",
      t1819ModA,
      `a) The survey shows that women tend to use Facebook more than men to know about their children.
b) The only reason why some parents are on Facebook is because they want to check on their children's activities.`,
      `a) What kind of information are parents looking for when they check their children's Facebook site? Name at least two details about the children's private life.
b) What is the survey director's attitude towards the results of the research?`,
      `a) discover (paragraph 1)
b) new information (paragraph 1)
c) stated (paragraph 3)
d) supervise (paragraph 4)`,
      `a) If your parents _______ (spy) on you, _______ would you have done?
b) This is the first serious published survey that _______ (deal) with Facebook's privacy. Every detail _______ (explain) with clarity and precision.
c) "How _______ do you use Facebook?" "I use it once _______ month."
d) Complete the following sentence to report what was said.
"What else did you see in my Facebook account?"
Mary asked her mother _____________________________________________.`,
      `"Parents have the right to spy or check up on their children". How far do you agree with this statement? Justify your answer.`,
      "Redes sociales / Familia",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 51,
    año: 2019,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Dangers of Perfume",
    preguntas: makePreguntas(
      "ing-1819Mod-B",
      t1819ModB,
      `a) A series of demands that some perfumes should be forbidden in certain places have been accepted.
b) Healthy perfumes are becoming less and less sophisticated.`,
      `a) What are the symptoms of MCS? Describe at least four.
b) State an advantage and a disadvantage of natural perfumes.`,
      `a) complaints (paragraph 1)
b) disputed (paragraph 2)
c) close to (paragraph 2)
d) harm (paragraph 3)`,
      `a) You _______ not wear too much perfume in places such _______ hospitals or classrooms.
b) My sister can't help _______ (cough) every _______ she smells my favourite perfume.
c) This particular perfume _______ (forbid) in Britain last month, but at home we had been using it _______ fifteen years.
d) I must remember _______ (buy) shampoo at this shop, _______ owner is always kind to me.`,
      "What is the impact of advertising campaigns on people's choice of perfumes?",
      "Salud / Consumo",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva","gerundio-e-infinitivo"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2018-2019 Extraordinaria ──────────────────────────────────────────────
  {
    id: 52,
    año: 2019,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Vampire Child",
    preguntas: makePreguntas(
      "ing-1819Ext-A",
      t1819ExtA,
      `a) Researchers have been able to determine the gender and the age of the child whose body was discovered in Italy.
b) Given that every inch of the cemetery has been examined, it's unlikely that more bodies might be discovered.`,
      `a) Why are these burials called "vampire burials"?
b) Why did so many babies and young children die in 400AD?`,
      `a) stone (paragraph 1)
b) enigmatic (paragraph 1)
c) excavated (paragraph 2)
d) place (paragraph 3)`,
      `a) I don't know________ vampires are faster _________ human beings.
b) Although people believe these scary stories are true, there is ______ evidence that vampires really ___________ (exist).
c) There _______ a lot of people around today ______ claim they are true vampires.
d) Complete the following sentence to report what was said.
"Stop telling me scary stories or I'll have to sleep with the lights on," my mother told me.
My mother told me _______________________________________________.`,
      "You and your friends decide to spend a night in the forest. Write a horror story.",
      "Historia / Misterio",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },
  {
    id: 53,
    año: 2019,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Quiz for divorce in China",
    preguntas: makePreguntas(
      "ing-1819Ext-B",
      t1819ExtB,
      `a) It is easier to get a divorce in China if you do not know a lot about your couple.
b) More women are making the decision of getting a divorce now than in the past.`,
      `a) Why does the government want to prevent divorce?
b) What does the idea of "room for recovery" refer to in the text?`,
      `a) accepted (paragraph 1)
b) include (paragraph 2)
c) goal (paragraph 4)
d) deal with (paragraph 4)`,
      `a) Fill-in-the gap questions are those _______ can _______ (answer) quickly with only a few words.
b) Chinese authorities _______ (regulate) aspects of family life _______ many years.
c) _______ what her father thought, she considered that getting a divorce was the _______ (good) option for her.
d) If she _______ (meet) him before, she _______ (marry) him.`,
      "Divorce rates in Spain have increased in the last few years. Why do you think this is so? Justify your answer.",
      "Sociedad / Familia",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","voz-pasiva","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2019-2020 Modelo ──────────────────────────────────────────────────────
  {
    id: 54,
    año: 2020,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Anne Morrow Lindbergh",
    preguntas: makePreguntas(
      "ing-1920Mod-A",
      t1920ModA,
      `a) Most people knew Anne more for her marriage than for her works.
b) Anne and Charles's wedding took place before she finished her studies.`,
      `a) How did Anne help her husband develop his career as a pilot?
b) Why did female readers feel so close to Anne?`,
      `a) awarded (paragraph 2)
b) permit (paragraph 2)
c) topic (paragraph 2)
d) reflective (paragraph 3)`,
      `a) If Ann _______ (not meet) Charles, _______ would she have done?
b) Charles Lindbergh, _______ was born in Detroit, _______ (say) to have fathered seven children outside his marriage to Anne Spencer Morrow.
c) Jane: "How _______ do you fly?"
David: "I usually fly twice _______ week."
d) Complete the following sentence to report what was said.
"What did you feel when you were flying over the Atlantic Ocean?"
Ann asked her husband_____________________________________________.`,
      "How would you like a job which required travelling very often? Justify your answer.",
      "Biografías / Aviación",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 55,
    año: 2020,
    tipo: "Modelo",
    convocatoria: "Modelo",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "Horse against Owner",
    preguntas: makePreguntas(
      "ing-1920Mod-B",
      t1920ModB,
      `a) After finding Justice in very poor conditions, the horse was cured in the same stable he was being kept.
b) The person who had owned Justice did not want to spend money on the medical expenses the horse might need from now on.`,
      `a) What is the lawyers' financial objective in this legal action?
b) How might this case change the way animals are treated in Oregon?`,
      `a) refuge (paragraph 1)
b) painful (paragraph 2)
c) alter (paragraph 2)
d) at hand (paragraph 2)`,
      `a) There is much less disagreement _______ the consequences of _______ (accept) that animals have rights.
b) Nowadays, only a small percentage of animal abuse _______ (report) to police. We need to know _______ important it is to recognise this abuse and report it.
c) _______ all the campaigns to prevent animal cruelty, last year the number of abandoned animals was much _______ (high) than ever before.
d) Complete the following sentence to report what was said.
"Do you think zoo animals are really happy?"
Nick asked his wife _____________________________________________.`,
      `"Animal cruelty is an important issue in Spain nowadays." Do you agree? Justify your answer.`,
      "Animales / Justicia",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","voz-pasiva","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2019-2020 Extraordinaria ──────────────────────────────────────────────
  {
    id: 56,
    año: 2020,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "University Education",
    preguntas: makePreguntas(
      "ing-1920Ext-A",
      t1920ExtA,
      `a) In the past studying at university opened the door to suitable job opportunities.
b) There exists a possibility for male university graduates to earn a lower salary than men who never studied at university.`,
      `a) Why do women find it economically more convenient to go to university than men – even when women choose a lower-paying career?
b) Is it still useful to study at university according to the text? Why/Why not?`,
      `a) try hard (paragraph 1)
b) a little (paragraph 2)
c) determine (paragraph 3)
d) inspirational (paragraph 4)`,
      `a) If I _______ (know) this university degree was going to be so difficult, I ______ (not/choose) it. But it's too late to make any changes now that I'm in 2nd year.
b) The London School of Economics, ________ usually scores highly in university rankings, ________ (report) last year as the one with the highest employment rate in the UK.
c) She hasn't succeeded in ________ (get) the results she wanted. Therefore, she intends ________ (sit) the exam next year again.
d) I'm so tired of school life: I've been looking _______ to starting university _______ I was in 3rd year of secondary education.`,
      `"Passion vs. Money". Which reasons will determine your university degree choice?`,
      "Educación / Trabajo",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 57,
    año: 2020,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    titulo: "The Ladies Bridge",
    preguntas: makePreguntas(
      "ing-1920Ext-B",
      t1920ExtB,
      `a) During World War II English women had to substitute male workers.
b) An article said that the contribution of women in the construction of the bridge was not mentioned on purpose.`,
      `a) Why did Rosie the Riveter become a symbol in the USA?
b) What happened at the official opening of the bridge?`,
      `a) called (paragraph 1)
b) possibly (paragraph 2)
c) lucky (paragraph 2)
d) supervised (paragraph 3)`,
      `a) Waterloo Bridge is known as the Ladies Bridge _______ the key role women _______ (play) in its construction.
b) More women were employed in industrial sectors _______ the early forties as the segregation between men and women _______ (diminish).
c) The government has decided to go _______ with the plans for building a new airport 50 kilometres away _______ the city.
d) They had worked hard all morning, so _______ midday they stopped _______ (have) a coffee and a sandwich.`,
      "Do you think the roles of men and women in society have changed over the last fifty years? Justify your answer.",
      "Historia / Igualdad",
      ["gramatica-transformacion-y-uso-de-estructuras"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2019-2020 Extraordinaria (coincidencias) ──────────────────────────────
  {
    id: 58,
    año: 2020,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "9:30",
    titulo: "China Sets Rules for Young Gamers",
    preguntas: makePreguntas(
      "ing-1920ExtCoin-A",
      t1920ExtCoinA,
      `a) Chinese authorities believe video game addiction is responsible for the increase in sight problems.
b) All parents are happy with the new video-gaming regulations.`,
      `a) How will the government ensure that young players are complying with regulations?
b) What are the restrictions on gaming in terms of time and money?`,
      `a) low (paragraph 1)
b) allowed (paragraph 1)
c) intended (paragraph 3)
d) concerned (paragraph 4)`,
      `a) In the past, children _______ (play) games on the streets _______ than at home.
b) The Internet _______ (not/invent) by a single person, but was the work of dozens of scientists, programmers and engineers _______ developed new features and technologies.
c) Internet addiction is a common problem that can be just _______ damaging _______ any other form of addiction.
d) Complete the following sentence to report what was said.
"How long do your children play computer games on weekdays?"
The school counsellor asked us _______________________________________.`,
      "Do you think technology can be addictive? Justify your answer.",
      "Tecnología / Adolescencia",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 59,
    año: 2020,
    tipo: "Extraordinaria",
    convocatoria: "Extraordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "9:30",
    titulo: "Ending the Age of Plastic",
    preguntas: makePreguntas(
      "ing-1920ExtCoin-B",
      t1920ExtCoinB,
      `a) Christine Figgener did not foresee the effects of the video on her professional life.
b) Nowadays, people have forgotten about Christine's video.`,
      `a) Describe the incident that Christine filmed.
b) What's the purpose of the pen-pal programme?`,
      `a) found (paragraph 1)
b) damage (paragraph 1)
c) do away with (paragraph 3)
d) canteen (paragraph 3)`,
      `a) If Greta Thurnberg _______ (not/start) her campaign against climate change, she_______ (be) less known.
b) When I turned _______ the television, my favourite show had_______ finished.
c) According to the United Nations, _______ least 800 species worldwide are affected by marine debris, and as much as 80 percent of that litter comes _______ plastic.
d) A recent study _______ (find) that sea turtles _______ ingest just 14 pieces of plastic with their food have an increased risk of death.`,
      "Why do you think there are still more men than women in science? Justify your answer.",
      "Medioambiente / Ciencia",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  // ── 2019-2020 Ordinaria Adicional (coincidencias) ─────────────────────────
  {
    id: 60,
    año: 2020,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "12:00",
    titulo: "Emojis and Food Allergies",
    preguntas: makePreguntas(
      "ing-1920OrdAdic-A",
      t1920OrdAdicA,
      `a) The most frequent food allergens are already present in the current emoji library.
b) Everybody thinks using emojis contributes to making texts richer.`,
      `a) How can emojis help people with food allergies?
b) What is the role of the Unicode Consortium?`,
      `a) main (paragraph 1)
b) choose (paragraph 1)
c) supervises (paragraph 2)
d) pieces (paragraph 2)`,
      `a) Emoji founder Shigetaka Kurita _______ (work) for a Japanese telecommunication firm in the 90s when he _______ (see) an opportunity to enhance written exchanges.
b) The use of food pictograms to communicate has been effective _______ early humans started drawing them _______ cave walls.
c) Emojis are becoming more popular _______ internet abbreviations _______ 'lol' or 'muah'.
d) Last year, a proposal _______ (send) to the Unicode Consortium, _______ is responsible for developing Unicode.`,
      "Are emojis helpful, are they simply a passing fashion, or are they actually destroying our languages? Write your opinion about it.",
      "Tecnología / Comunicación",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 61,
    año: 2020,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "12:00",
    titulo: "The Worst Hotel in the World",
    preguntas: makePreguntas(
      "ing-1920OrdAdic-B",
      t1920OrdAdicB,
      `a) The proprietors are bothered by the fact that their hotel is rated the worst hotel in the area.
b) Apparently, not many travellers want to stay in this hotel.`,
      `a) How does the Hans Brinker Hotel avoid complaints?
b) Name two positive comments about the hotel mentioned in the reviews.`,
      `a) beforehand (paragraph 1)
b) mortal (paragraph 1)
c) humble (paragraph 3)
d) employees (paragraph 4)`,
      `a) The only 7-star hotel, _______ is situated in Dubai, _______ (consider) to be the world's most luxurious hotel.
b) Text marketing is not just about _______ (send out) offers _______ your previous and prospective customers.
c) I _______ (just/return) from the greatest summer holiday! It was _______ fantastic that I never wanted it to end.
d) Complete the following sentence to report what was said.
"We want to thank you and your family for being such loyal guests."
The manager told me _______________________________________________.`,
      "Have you ever stayed at a really bad hotel or accommodation? Describe the experience or imagine what it would have been like.",
      "Turismo / Humor",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","voz-pasiva"],
      ["redaccion-narrativa-descriptiva-personal"]
    ),
  },

  // ── 2020-2021 y 2021-2022 Ordinaria coincidencias/adicional ────────────────
  {
    id: 62,
    año: 2021,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "12:00",
    titulo: "In Praise of Loud Women",
    preguntas: makePreguntas(
      "ing-2021OrdCoin-A",
      t2021OrdCoinA,
      `Are the following statements TRUE or FALSE? Copy the evidence from the text. No
marks are given for only TRUE or FALSE.
a) “Loud woman” is generally considered a pleasing comment.
b) No significant changes have taken place in women’s speech in the last two decades.`,
      `In your own words and based on the ideas in the text, answer the following questions.
Do not copy from the text.
a) Has “being loud” been an acceptable social behaviour for women? Explain.
b) Why is Michelle Obama popular as a speaker?`,
      `Find the words in the text that mean:
a) inference (paragraph 1)
b) mind (paragraph 1)
c) obvious (paragraph 2)
d) outstanding (paragraph 3)`,
      `Complete the following sentences. Use the appropriate form of the word in brackets
when given.
a) Is _______ (be) female a disadvantage in public speaking? Mrs. Clinton’s problem
might lie in our contradictory attitudes _______ women’s public speech.
b) Last month, Michelle Obama _______ (do) a talk at the Democratic National
Convention _______ rocked.
c) TEDWomen is a conference _______ the power of women and girls to be creators
and change-makers. The program of speakers, workshops and events _______
(spark) some of TED’s most iconic moments so far.
d) Women are more _______ (like) to speak up if questions_______ (ask).`,
      `Good communication skills can help you in your life. Discuss.`,
      "Comunicación / Género",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 63,
    año: 2021,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "12:00",
    titulo: "Dogs are Humans’ Oldest Companions",
    preguntas: makePreguntas(
      "ing-2021OrdCoin-B",
      t2021OrdCoinB,
      `Are the following statements TRUE or FALSE? Copy the evidence from the text. No
marks are given for only TRUE or FALSE.
a) Dogs were domesticated almost ten thousand years ago.
b) The investigation provides several data about the evolution of dogs that we did not know
before.`,
      `In your own words and based on the ideas in the text, answer the following questions. Do
not copy from the text.
a) Why is dog genomics partly similar to the one of human beings?
b) What does the text say about the origin of dogs?`,
      `Find the words in the text that mean:
a) signs (paragraph 2)
b) scary (paragraph 3)
c) domesticated (paragraph 4)
d) cultivate (paragraph 5)`,
      `Complete the following sentences. Use the appropriate form of the word in brackets when
given.
a) Since recorded history began, scientists _______ (distinguish) between species
_______ the basis of how they look, behave or live.
b) Mammals _______ dogs or cats or rabbits do not lay eggs, but the mother keeps the egg
inside her and _______ (give) birth to the fully developed baby animal.
c) _______ (use) DNA from ancient dogs is showing us just _______ far back our shared
history goes.
d) Researchers found dog owners were likely to live _______ (long) than those _______
didn’t have dogs.`,
      `What are the pros and cons of keeping a pet?`,
      "Animales / Ciencia",
      ["gramatica-transformacion-y-uso-de-estructuras","voz-pasiva","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 64,
    año: 2022,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "A",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "12:00",
    titulo: "Knocker Uppers",
    preguntas: makePreguntas(
      "ing-2022OrdCoin-A",
      t2022OrdCoinA,
      `Are the following statements TRUE or FALSE? Copy the evidence from the text. Use a
complete sentence. No marks are given for only TRUE or FALSE.
a) Knocker uppers only used sticks to do their jobs.
b) Knocker uppers waited for their clients to wake up before moving to the next house.`,
      `In your own words and based on the ideas in the text, answer the following questions.
Do not copy from the text.
a) Which two main problems did knocker uppers have at the beginning?
b) What kind of people hired knocker uppers?`,
      `Find the words in the text that mean:
a) familiar (paragraph 1)
b) on an upper floor (paragraph 2)
c) went on (paragraph 3)
d) annoy (paragraph 3)`,
      `Complete the following sentences. Use the appropriate form of the word in brackets
when given.
a) I _______ (usual) sleep well but recently I've been having such strange dreams that they’re
beginning _______ (scare) me.
b) The less you sleep, the _______ (big) the impact _______ your health.
c) If you _______ (set) the alarm clock as I told you last night, you _______ (not / oversleep).
d) Last week, she _______ (ask) how many hours she needs to be ready ________ an exam.`,
      `“A good laugh and a long sleep are the best cures for anything.” Do you agree? Justify your answer.`,
      "Historia social / Trabajo",
      ["gramatica-transformacion-y-uso-de-estructuras","oraciones-condicionales","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },
  {
    id: 65,
    año: 2022,
    tipo: "Ordinaria",
    convocatoria: "Ordinaria",
    opcion: "B",
    asignatura: "Inglés",
    comunidad: "Madrid",
    dia: "12:00",
    titulo: "The Secret History of Monopoly",
    preguntas: makePreguntas(
      "ing-2022OrdCoin-B",
      t2022OrdCoinB,
      `Are the following statements TRUE or FALSE? Copy the evidence from the text. No
marks are given for only TRUE or FALSE.
a) Todd easily facilitated the written rules for Monopoly.
b) Magie copied the rules from the Darrows.`,
      `In your own words and based on the ideas in the text, answer the following questions.
Do not copy from the text.
a) How was Monopoly played originally?
b) How did Charles Darrow make a profit from the Monopoly game?`,
      `Find the words in the text that mean:
a) happy (paragraph 1)
b) actually (paragraph 1)
c) provide for (paragraph 2)
d) surprising (paragraph 3)`,
      `Complete the following sentences. Use the appropriate form of the word in brackets
when given.
a) Acknowledged as a very _______ (success) game, Monopoly is a board game where two or
more players play against _______ another.
b) The history of Monopoly is based _______ accounts that were known a long time after it
_______ (register) by Parker Bros.
c) There were few possibilities _______ Magie to be recognized as the inventor of the game
because she _______ (lose) the legal war.
d) Complete the following sentence to report what was said.
“Who was the best Trivial Pursuit player in 2021?”
I asked my sister ______________________________________________________________.`,
      `What is your favorite board game? Why? Explain.`,
      "Juegos / Historia",
      ["gramatica-transformacion-y-uso-de-estructuras","estilo-indirecto-reported-speech","voz-pasiva","comparativos-y-superlativos"],
      ["redaccion-ensayo-de-opinion"]
    ),
  },

  ...examenesInglesCataluna,
]
