// Unpointed Hebrew can have several readings. Each gloss gives one common reading.
const entries = `אהבה|love
אחד|one
חי|alive
שלום|peace
אמת|truth
תורה|Torah
ישראל|Israel
יין|wine
סוד|secret
משיח|anointed one
נחש|serpent
יהוה|the Divine Name
עשו|Esau
משלו|they ruled
שלמו|they paid
אור|light
חושך|darkness
יום|day
לילה|night
בוקר|morning
ערב|evening
צהרים|noon
שחר|dawn
שמש|sun
ירח|moon
כוכב|star
שמים|heavens
ארץ|earth
עולם|world
ים|sea
מים|water
נהר|river
נחל|stream
מעין|spring
באר|well
גל|wave
טל|dew
גשם|rain
שלג|snow
ברד|hail
ענן|cloud
רוח|wind
אש|fire
עפר|dust
אבן|stone
סלע|rock
חול|sand
הר|mountain
גבעה|hill
עמק|valley
שדה|field
יער|forest
מדבר|desert
גן|garden
עץ|tree
עלה|leaf
ענף|branch
פרח|flower
שורש|root
זרע|seed
פרי|fruit
גפן|vine
ענב|grape
תאנה|fig
רמון|pomegranate
זית|olive
תמר|date palm
חיטה|wheat
שעורה|barley
ארז|cedar
אלון|oak
שושנה|rose
דשא|grass
אדם|human
איש|man
אשה|woman
ילד|child
בת|daughter
בן|son
אב|father
אם|mother
אח|brother
אחות|sister
סב|grandfather
סבתא|grandmother
משפחה|family
חבר|friend
עם|people
קהל|assembly
לב|heart
נפש|soul
נשמה|soul
גוף|body
ראש|head
פנים|face
יד|hand
רגל|foot
עין|eye
אוזן|ear
פה|mouth
לשון|tongue
קול|voice
שם|name
חיים|life
כח|strength
עוז|might
שמח|happy
שמחה|joy
חסד|kindness
צדק|justice
צדקה|charity
אמונה|faith
תקוה|hope
רחמים|compassion
חן|grace
כבוד|honor
חכמה|wisdom
בינה|understanding
דעת|knowledge
שכל|intellect
זכרון|memory
חלום|dream
מחשבה|thought
רצון|will
חירות|freedom
סבלנות|patience
ענוה|humility
טוב|good
יפה|beautiful
גדול|great
קטן|small
חדש|new
ישן|old
מתוק|sweet
לחם|bread
מלח|salt
דבש|honey
שמן|oil
חלב|milk
ביצה|egg
תפוח|apple
אגוז|nut
שקד|almond
דג|fish
עוף|bird
יונה|dove
נשר|eagle
עורב|raven
צבי|gazelle
אריה|lion
דוב|bear
זאב|wolf
שועל|fox
סוס|horse
חמור|donkey
גמל|camel
כבש|sheep
עז|goat
שור|ox
פרה|cow
כלב|dog
חתול|cat
דבורה|bee
נמלה|ant
פרפר|butterfly
בית|house
דלת|door
חלון|window
שער|gate
חומה|wall
גג|roof
חדר|room
דרך|way
שביל|path
רחוב|street
עיר|city
כפר|village
מקום|place
כיסא|chair
שולחן|table
כוס|cup
נר|candle
מנורה|lamp
שעון|clock
מפתח|key
כלי|vessel
זהב|gold
כסף|silver
נחושת|copper
ברזל|iron
ספר|book
אות|letter
מלה|word
כתב|script
שפה|language
שיר|song
זמר|singing
ניגון|melody
פסוק|verse
פרק|chapter
לוח|tablet
דף|page
דיו|ink
עט|pen
מלך|king
מלכה|queen
כהן|priest
נביא|prophet
חכם|sage
רב|rabbi
תלמיד|student
מורה|teacher
סופר|scribe
שופט|judge
שבת|Sabbath
חג|festival
מועד|appointed time
שנה|year
חודש|month
שבוע|week
שעה|hour
זמן|time
רגע|moment
פסח|Passover
שבועות|Shavuot
סוכות|Sukkot
פורים|Purim
חנוכה|Hanukkah
אלול|Elul
ניסן|Nisan
תשרי|Tishrei
אדר|Adar
אברהם|Abraham
שרה|Sarah
יצחק|Isaac
רבקה|Rebecca
יעקב|Jacob
רחל|Rachel
לאה|Leah
יוסף|Joseph
משה|Moses
אהרן|Aaron
מרים|Miriam
דוד|David
שלמה|Solomon
רות|Ruth
אסתר|Esther
נח|Noah
חוה|Eve
ציון|Zion
ירושלים|Jerusalem
סיני|Sinai
עדן|Eden
מצוה|commandment
תפילה|prayer
ברכה|blessing
שופר|shofar
טלית|prayer shawl
מזוזה|mezuzah
תשובה|return
ברית|covenant
גאולה|redemption
קדושה|holiness
הלל|praise
תודה|thanks
אמן|amen
שבת שלום|a peaceful Sabbath
חג שמח|happy holiday
שנה טובה|a good year
בוקר טוב|good morning
ערב טוב|good evening
לילה טוב|good night
מזל טוב|congratulations
תודה רבה|many thanks
לב טוב|a good heart
עץ חיים|tree of life
ספר תורה|Torah scroll
בית כנסת|synagogue
ארץ ישראל|Land of Israel
שמע ישראל|Hear, O Israel
ראש השנה|Jewish New Year
יום כיפור|Day of Atonement
ים המלח|Dead Sea
שיר השירים|Song of Songs
אהבת חינם|unconditional love`;

export const lexicon = entries.split('\n').map(entry => {
  const [word, gloss] = entry.split('|');
  return { word, gloss };
});
