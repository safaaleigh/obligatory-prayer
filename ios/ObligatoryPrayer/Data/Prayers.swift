import Foundation

enum PrayerID: String, CaseIterable, Identifiable, Hashable {
    case short, medium, long
    var id: String { rawValue }
}

struct Phrase: Identifiable, Hashable {
    enum Kind: Hashable { case instruction, prayer }
    let id = UUID()
    let kind: Kind
    let text: String
}

struct Prayer: Identifiable, Hashable {
    let id: PrayerID
    let title: String
    let timing: String
    let descriptionText: String
    let phrases: [Phrase]
}

private func i(_ text: String) -> Phrase { Phrase(kind: .instruction, text: text) }
private func p(_ text: String) -> Phrase { Phrase(kind: .prayer, text: text) }

let prayers: [PrayerID: Prayer] = [
    .short: Prayer(
        id: .short,
        title: "Short Obligatory Prayer",
        timing: "To be recited once in twenty-four hours, at noon",
        descriptionText: "A brief prayer for daily recitation",
        phrases: [
            i("To be recited once in twenty-four hours, at noon"),
            p("I bear witness, O my God, that Thou hast created me to know Thee and to worship Thee."),
            p("I testify, at this moment, to my powerlessness and to Thy might, to my poverty and to Thy wealth."),
            p("There is none other God but Thee, the Help in Peril, the Self-Subsisting."),
            i("Prayer completed")
        ]
    ),
    .medium: Prayer(
        id: .medium,
        title: "Medium Obligatory Prayer",
        timing: "To be recited daily, in the morning, at noon, and in the evening",
        descriptionText: "A prayer with movements, recited three times daily",
        phrases: [
            i("To be recited daily, in the morning, at noon, and in the evening"),
            i("Whoso wisheth to pray, let him wash his hands, and while he washeth, let him say:"),
            p("Strengthen my hand, O my God, that it may take hold of Thy Book with such steadfastness that the hosts of the world shall have no power over it."),
            p("Guard it, then, from meddling with whatsoever doth not belong unto it. Thou art, verily, the Almighty, the Most Powerful."),
            i("And while washing his face, let him say:"),
            p("I have turned my face unto Thee, O my Lord! Illumine it with the light of Thy countenance. Protect it, then, from turning to anyone but Thee."),
            i("Then let him stand up, and facing the Qiblih (Point of Adoration, i.e., Bahjí, ‘Akká), let him say:"),
            p("God testifieth that there is none other God but Him. His are the kingdoms of Revelation and of creation."),
            p("He, in truth, hath manifested Him Who is the Dayspring of Revelation, Who conversed on Sinai, through Whom the Supreme Horizon hath been made to shine, and the Lote-Tree beyond which there is no passing hath spoken, and through Whom the call hath been proclaimed unto all who are in heaven and on earth:"),
            p("\"Lo, the All-Possessing is come. Earth and heaven, glory and dominion are God’s, the Lord of all men, and the Possessor of the Throne on high and of earth below!\""),
            i("Let him, then, bend down, with hands resting on the knees, and say:"),
            p("Exalted art Thou above my praise and the praise of anyone beside me, above my description and the description of all who are in heaven and all who are on earth!"),
            i("Then, standing with open hands, palms upward toward the face, let him say:"),
            p("Disappoint not, O my God, him that hath, with beseeching fingers, clung to the hem of Thy mercy and Thy grace, O Thou Who of those who show mercy art the Most Merciful!"),
            i("Let him, then, be seated and say:"),
            p("I bear witness to Thy unity and Thy oneness, and that Thou art God, and that there is none other God beside Thee."),
            p("Thou hast, verily, revealed Thy Cause, fulfilled Thy Covenant, and opened wide the door of Thy grace to all that dwell in heaven and on earth."),
            p("Blessing and peace, salutation and glory, rest upon Thy loved ones, whom the changes and chances of the world have not deterred from turning unto Thee, and who have given their all, in the hope of obtaining that which is with Thee."),
            p("Thou art, in truth, the Ever-Forgiving, the All-Bountiful."),
            i("Prayer completed")
        ]
    ),
    .long: Prayer(
        id: .long,
        title: "Long Obligatory Prayer",
        timing: "To be recited once in twenty-four hours",
        descriptionText: "The most comprehensive obligatory prayer",
        phrases: [
            i("To be recited once in twenty-four hours"),
            i("Whoso wisheth to recite this prayer, let him stand up and turn unto God, and, as he standeth in his place, let him gaze to the right and to the left, as if awaiting the mercy of his Lord, the Most Merciful, the Compassionate. Then let him say:"),
            p("O Thou Who art the Lord of all names and the Maker of the heavens! I beseech Thee by them Who are the Daysprings of Thine invisible Essence, the Most Exalted, the All-Glorious, to make of my prayer a fire that will burn away the veils which have shut me out from Thy beauty, and a light that will lead me unto the ocean of Thy Presence."),
            i("Let him then raise his hands in supplication toward God—blessed and exalted be He—and say:"),
            p("O Thou the Desire of the world and the Beloved of the nations! Thou seest me turning toward Thee, and rid of all attachment to anyone save Thee, and clinging to Thy cord, through whose movement the whole creation hath been stirred up."),
            p("I am Thy servant, O my Lord, and the son of Thy servant. Behold me standing ready to do Thy will and Thy desire, and wishing naught else except Thy good pleasure."),
            p("I implore Thee by the Ocean of Thy mercy and the Daystar of Thy grace to do with Thy servant as Thou willest and pleasest. By Thy might which is far above all mention and praise!"),
            p("Whatsoever is revealed by Thee is the desire of my heart and the beloved of my soul. O God, my God! Look not upon my hopes and my doings, nay rather look upon Thy will that hath encompassed the heavens and the earth."),
            p("By Thy Most Great Name, O Thou Lord of all nations! I have desired only what Thou didst desire, and love only what Thou dost love."),
            i("Let him then kneel, and bowing his forehead to the ground, let him say:"),
            p("Exalted art Thou above the description of anyone save Thyself, and the comprehension of aught else except Thee."),
            i("Let him then stand and say:"),
            p("Make my prayer, O my Lord, a fountain of living waters whereby I may live as long as Thy sovereignty endureth, and may make mention of Thee in every world of Thy worlds."),
            i("Let him again raise his hands in supplication, and say:"),
            p("O Thou in separation from Whom hearts and souls have melted, and by the fire of Whose love the whole world hath been set aflame! I implore Thee by Thy Name through which Thou hast subdued the whole creation, not to withhold from me that which is with Thee, O Thou Who rulest over all men!"),
            p("Thou seest, O my Lord, this stranger hastening to his most exalted home beneath the canopy of Thy majesty and within the precincts of Thy mercy; and this transgressor seeking the ocean of Thy forgiveness; and this lowly one the court of Thy glory; and this poor creature the orient of Thy wealth."),
            p("Thine is the authority to command whatsoever Thou willest. I bear witness that Thou art to be praised in Thy doings, and to be obeyed in Thy behests, and to remain unconstrained in Thy bidding."),
            i("Let him then raise his hands, and repeat three times the Greatest Name. Let him then bend down with hands resting on the knees before God—blessed and exalted be He—and say:"),
            p("Thou seest, O my God, how my spirit hath been stirred up within my limbs and members, in its longing to worship Thee, and in its yearning to remember Thee and extol Thee; how it testifieth to that whereunto the Tongue of Thy Commandment hath testified in the kingdom of Thine utterance and the heaven of Thy knowledge."),
            p("I love, in this state, O my Lord to beg of Thee all that is with Thee, that I may demonstrate my poverty, and magnify Thy bounty and Thy riches, and may declare my powerlessness, and manifest Thy power and Thy might."),
            i("Let him then stand and raise his hands twice in supplication, and say:"),
            p("There is no God but Thee, the Almighty, the All-Bountiful. There is no God but Thee, the Ordainer, both in the beginning and in the end."),
            p("O God, my God! Thy forgiveness hath emboldened me, and Thy mercy hath strengthened me, and Thy call hath awakened me, and Thy grace hath raised me up and led me unto Thee."),
            p("Who, otherwise, am I that I should dare to stand at the gate of the city of Thy nearness, or set my face toward the lights that are shining from the heaven of Thy will?"),
            p("Thou seest, O my Lord, this wretched creature knocking at the door of Thy grace, and this evanescent soul seeking the river of everlasting life from the hands of Thy bounty."),
            p("Thine is the command at all times, O Thou Who art the Lord of all names; and mine is resignation and willing submission to Thy will, O Creator of the heavens!"),
            i("Let him then raise his hands thrice, and say:"),
            p("Greater is God than every great one!"),
            i("Let him then kneel and, bowing his forehead to the ground, say:"),
            p("Too high art Thou for the praise of those who are nigh unto Thee to ascend unto the heaven of Thy nearness, or for the birds of the hearts of them who are devoted to Thee to attain to the door of Thy gate."),
            p("I testify that Thou hast been sanctified above all attributes and holy above all names. No God is there but Thee, the Most Exalted, the All-Glorious."),
            i("Let him then seat himself and say:"),
            p("I testify unto that whereunto have testified all created things, and the Concourse on high, and the inmates of the all-highest Paradise, and beyond them the Tongue of Grandeur itself from the all-glorious Horizon, that Thou art God, that there is no God but Thee, and that He Who hath been manifested is the Hidden Mystery, the Treasured Symbol, through Whom the letters B and E (Be) have been joined and knit together."),
            p("I testify that it is He Whose name hath been set down by the Pen of the Most High, and Who hath been mentioned in the Books of God, the Lord of the Throne on high and of earth below."),
            i("Let him then stand erect and say:"),
            p("O Lord of all being and Possessor of all things visible and invisible! Thou dost perceive my tears and the sighs I utter, and hearest my groaning, and my wailing, and the lamentation of my heart."),
            p("By Thy might! My trespasses have kept me back from drawing nigh unto Thee; and my sins have held me far from the court of Thy holiness."),
            p("Thy love, O my Lord, hath enriched me, and separation from Thee hath destroyed me, and remoteness from Thee hath consumed me."),
            p("I entreat Thee by Thy footsteps in this wilderness, and by the words \"Here am I. Here am I,\" which Thy chosen Ones have uttered in this immensity, and by the breaths of Thy Revelation, and the gentle winds of the Dawn of Thy Manifestation, to ordain that I may gaze on Thy beauty and observe whatsoever is in Thy Book."),
            i("Let him then repeat the Greatest Name thrice, and bend down with hands resting on the knees, and say:"),
            p("Praise be to Thee, O my God, that Thou hast aided me to remember Thee and to praise Thee, and hast made known unto me Him Who is the Dayspring of Thy signs, and hast caused me to bow down before Thy Lordship, and humble myself before Thy Godhead, and to acknowledge that which hath been uttered by the Tongue of Thy grandeur."),
            i("Let him then rise and say:"),
            p("O God, my God! My back is bowed by the burden of my sins, and my heedlessness hath destroyed me."),
            p("Whenever I ponder my evil doings and Thy benevolence, my heart melteth within me, and my blood boileth in my veins."),
            p("By Thy Beauty, O Thou the Desire of the world! I blush to lift up my face to Thee, and my longing hands are ashamed to stretch forth toward the heaven of Thy bounty."),
            p("Thou seest, O my God, how my tears prevent me from remembering Thee and from extolling Thy virtues, O Thou the Lord of the Throne on high and of earth below!"),
            p("I implore Thee by the signs of Thy Kingdom and the mysteries of Thy Dominion to do with Thy loved ones as becometh Thy bounty, O Lord of all being, and is worthy of Thy grace, O King of the seen and the unseen!"),
            i("Let him then repeat the Greatest Name thrice, and kneel with his forehead to the ground, and say:"),
            p("Praise be unto Thee, O our God, that Thou hast sent down unto us that which draweth us nigh unto Thee, and supplieth us with every good thing sent down by Thee in Thy Books and Thy Scriptures."),
            p("Protect us, we beseech Thee, O my Lord, from the hosts of idle fancies and vain imaginations. Thou, in truth, art the Mighty, the All-Knowing."),
            i("Let him then raise his head, and seat himself, and say:"),
            p("I testify, O my God, to that whereunto Thy chosen Ones have testified, and acknowledge that which the inmates of the all-highest Paradise and those who have circled round Thy mighty Throne have acknowledged. The kingdoms of earth and heaven are Thine, O Lord of the worlds!"),
            i("Prayer completed")
        ]
    )
]
