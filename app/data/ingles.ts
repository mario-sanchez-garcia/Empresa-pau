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
}

export interface ExamenIngles {
  id: number
  año: number
  tipo: "Ordinaria" | "Extraordinaria"
  convocatoria: "Ordinaria" | "Extraordinaria"
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

// ─── Shared correction criteria strings ──────────────────────────────────────

const crit1 = "1 punto por apartado (2 en total). La respuesta TRUE o FALSE debe ir justificada con una cita textual completa. Sin cita = 0 puntos en ese apartado."
const crit1_ng = "1 punto por apartado (2 en total). Indica T/F/NG eligiendo 2 de los 3 enunciados. En T/F copia la oración del texto como evidencia. Si la respuesta es NG, no escribas nada más."
const crit2 = "1 punto por pregunta (2 en total). 0,5 puntos por las ideas parafraseadas + 0,5 puntos por la expresión. No copiar el texto literal."
const crit3 = "0,25 puntos por cada sinónimo correcto adecuado al contexto (4 ítems = 1 punto)."
const crit4_old = "0,25 puntos por cada hueco en blanco correcto. 0,5 puntos por cada transformación o ítem complejo (con carácter unitario). Las respuestas deben ser gramatical, ortográfica y semánticamente correctas."
const crit4_new = "Responde 4 de las 6 cuestiones propuestas. 0,5 puntos por cada respuesta correcta (carácter unitario). La oración debe ser ortográfica, gramatical y semánticamente correcta según las indicaciones dadas."
const crit5_old = "Redacción de 150-200 palabras. 3 puntos: 1,5 pts por dominio del idioma (léxico, gramática, ortografía) y 1,5 pts por madurez en las ideas (organización, coherencia, creatividad)."
const crit5_new = "Redacción de 150-200 palabras eligiendo 1 de 2 opciones. 3 puntos: 6 apartados de 0,5 pts cada uno — adecuación/tarea, ideas/organización, conectores/coherencia, gramática, vocabulario, ortografía."

// ─── Helper to build 5 questions for a pre-2024 exam ─────────────────────────

function makePreguntas(
  prefix: string,
  texto: string,
  q1Items: string,
  q2Items: string,
  q3Items: string,
  q4Items: string,
  q5Prompt: string,
  tema: string
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
      "Matrimonio / Sociedad"
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
      "Historia / Humanitarismo"
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
      "Psicología / Experiencias personales"
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
      "Activismo / Redes sociales"
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
      "Anécdotas / Solidaridad"
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
      "Historia / Entretenimiento"
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
      "Cultura / Entretenimiento"
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
      "Medio ambiente / Tecnología"
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
      "Comunicación / Tecnología"
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
      "Historia / Segunda Guerra Mundial"
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
      "Deporte / Diversidad"
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
      "Política / Participación ciudadana"
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
      "Trabajo / Diversidad"
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
      "Medio ambiente / Moda"
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
      "Medios / Historia"
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
      "Tecnología / Comunicación"
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
      "Historia / Música"
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
      "Medio ambiente / Salud"
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
      "Cultura / Comportamiento social"
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
      "Salud / Nutrición"
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
      "Familia / Naturaleza"
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
      "Tecnología / Educación"
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
      "Ciencia / Mujeres"
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
      "Salud / Tradiciones"
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
  ...examenesInglesCataluna,
]
