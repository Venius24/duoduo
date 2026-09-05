import { bossMix, item, sen, unit } from './builders'
import type { Course } from './types'

const it = (ru: string, t: string) => item('en', ru, t)

const u1a = [
  it('привет', 'hello'),
  it('пока', 'bye'),
  it('да', 'yes'),
  it('нет', 'no'),
  it('пожалуйста', 'please'),
  it('спасибо', 'thank you')
]
const u1b = [
  it('извини(те)', 'sorry'),
  it('до свидания', 'goodbye'),
  it('доброе утро', 'good morning'),
  it('спокойной ночи', 'good night'),
  it('как дела', 'how are you'),
  it('у меня всё хорошо', "I'm fine")
]
const s1_1 = sen('Спасибо большое!', 'Thank you very much!')
const s1_2 = sen('Привет, как дела?', 'Hi, how are you?')
const s1_3 = sen("У меня всё хорошо, спасибо!", "I'm fine, thank you!")
const s1_4 = sen('Доброе утро, друг!', 'Good morning, friend!')

const u1c = [
  it('меня зовут', 'my name is'),
  it('как тебя зовут', 'what is your name'),
  it('это…', 'this is'),
  it('друг', 'friend'),
  it('учитель', 'teacher'),
  it('студент', 'student'),
  it('приятно познакомиться', 'nice to meet you')
]
const s1_5 = sen('Меня зовут Анна.', 'My name is Anna.')
const s1_6 = sen('Это мой друг.', 'This is my friend.')
const s1_7 = sen('Приятно познакомиться!', 'Nice to meet you!')

const u1d = [
  it('я', 'I'),
  it('он', 'he'),
  it('она', 'she'),
  it('мужчина', 'man'),
  it('женщина', 'woman'),
  it('мальчик', 'boy'),
  it('девочка', 'girl')
]
const s1_8 = sen('Он мой друг.', 'He is my friend.')
const s1_9 = sen('Она учитель.', 'She is a teacher.')

const u2a = [
  it('мама', 'mom'),
  it('папа', 'dad'),
  it('сестра', 'sister'),
  it('брат', 'brother'),
  it('сын', 'son'),
  it('дочь', 'daughter'),
  it('любить', 'love')
]
const u2b = [
  it('бабушка', 'grandmother'),
  it('дедушка', 'grandfather'),
  it('жена', 'wife'),
  it('муж', 'husband'),
  it('семья', 'family')
]
const s2_1 = sen('Это моя мама.', 'This is my mom.')
const s2_2 = sen('Мой папа дома.', 'My dad is at home.')
const s2_3 = sen('Я люблю маму и папу.', 'I love mom and dad.')
const s2_4 = sen('Моя сестра маленькая.', 'My sister is small.')
const s2_5 = sen('Мой брат хороший.', 'My brother is good.')
const s2_6 = sen('Дедушка старый.', 'Grandfather is old.')
const s2_7 = sen('Бабушка дома.', 'Grandmother is at home.')
const u2c = [
  it('мой', 'my'),
  it('твой', 'your'),
  it('его', 'his'),
  it('её', 'her')
]
const s2_8 = sen('Её сестра — учитель.', 'Her sister is a teacher.')
const s2_9 = sen('Его брат — студент.', 'His brother is a student.')
const s2_10 = sen('Твоя мама дома?', 'Is your mom at home?')
const s2_11 = sen('Моя семья очень большая.', 'My family is very big.')
const u2d = [
  it('большой', 'big'),
  it('маленький', 'small'),
  it('хороший', 'good'),
  it('красивый', 'beautiful'),
  it('старый', 'old'),
  it('молодой', 'young')
]
const s2_12 = sen('Папа молодой.', 'Dad is young.')
const s2_13 = sen('Мама красивая.', 'Mom is beautiful.')

const u3a = [
  it('вода', 'water'),
  it('хлеб', 'bread'),
  it('молоко', 'milk'),
  it('сыр', 'cheese'),
  it('яблоко', 'apple'),
  it('чай', 'tea')
]
const s3_1 = sen('Вода и хлеб.', 'Water and bread.')
const s3_2 = sen('Молоко вкусное.', 'Milk is tasty.')
const s3_3 = sen('Яблоко, пожалуйста.', 'An apple, please.')
const u3b = [
  it('есть, кушать', 'eat'),
  it('пить', 'drink'),
  it('хотеть', 'want'),
  it('голодный', 'hungry'),
  it('вкусный', 'tasty')
]
const s3_4 = sen('Я хочу чай.', 'I want tea.')
const s3_5 = sen('Я ем яблоко.', 'I eat an apple.')
const s3_6 = sen('Она пьёт кофе.', 'She drinks coffee.')
const s3_7 = sen('Я голоден!', 'I am hungry!')
const u3c = [
  it('кофе', 'coffee'),
  it('суп', 'soup'),
  it('рыба', 'fish'),
  it('рис', 'rice'),
  it('яйцо', 'egg'),
  it('завтрак', 'breakfast'),
  it('сок', 'juice')
]
const s3_8 = sen('Суп очень вкусный.', 'The soup is very tasty.')
const s3_9 = sen('Рыба и рис, пожалуйста.', 'Fish and rice, please.')
const u3d = [
  it('обед', 'lunch'),
  it('ужин', 'dinner'),
  it('меню', 'menu'),
  it('счёт', 'the bill'),
  it('сколько', 'how much'),
  it('холодный', 'cold')
]
const s3_10 = sen('Меню, пожалуйста!', 'The menu, please!')
const s3_11 = sen('Сколько стоит счёт?', 'How much is the bill?')
const s3_12 = sen('Сок холодный.', 'The juice is cold.')

const u4a = [
  it('дом (здание)', 'house'),
  it('дом (мой)', 'home'),
  it('комната', 'room'),
  it('кухня', 'kitchen'),
  it('дверь', 'door'),
  it('окно', 'window'),
  it('открывать', 'open')
]
const s4_1 = sen('Я дома.', 'I am at home.')
const s4_2 = sen('Дом большой.', 'The house is big.')
const s4_3 = sen('Открой дверь, пожалуйста.', 'Open the door, please.')
const u4b = [
  it('стол', 'table'),
  it('стул', 'chair'),
  it('кровать', 'bed'),
  it('ключ', 'key'),
  it('кот', 'cat')
]
const s4_4 = sen('Кот под столом.', 'The cat is under the table.')
const s4_5 = sen('Ключи на столе.', 'The keys are on the table.')
const s4_6 = sen('Моя комната маленькая.', 'My room is small.')
const u4c = [
  it('город', 'city'),
  it('улица', 'street'),
  it('магазин', 'shop'),
  it('школа', 'school'),
  it('парк', 'park'),
  it('машина', 'car')
]
const s4_7 = sen('Где школа?', 'Where is the school?')
const s4_8 = sen('Машина на улице.', 'The car is on the street.')
const s4_9 = sen('Парк здесь, а магазин там.', 'The park is here, and the shop is there.')
const u4d = [
  it('в', 'in'),
  it('на', 'on'),
  it('под', 'under'),
  it('где?', 'where'),
  it('здесь', 'here'),
  it('там', 'there')
]
const s4_10 = sen('Книга на столе.', 'The book is on the table.')
const s4_11 = sen('Школа в городе.', 'The school is in the city.')

const u5a = [
  it('сегодня', 'today'),
  it('завтра', 'tomorrow'),
  it('вчера', 'yesterday'),
  it('сейчас', 'now'),
  it('день', 'day'),
  it('ночь', 'night')
]
const s5_1 = sen('Сегодня хороший день.', 'Today is a good day.')
const s5_2 = sen('Завтра я работаю.', 'Tomorrow I work.')
const s5_3 = sen('Сейчас ночь.', 'It is night now.')
const u5b = [
  it('утро', 'morning'),
  it('вечер', 'evening'),
  it('неделя', 'week'),
  it('месяц', 'month'),
  it('год', 'year'),
  it('время', 'time')
]
const s5_4 = sen('Время — деньги.', 'Time is money.')
const s5_5 = sen('Добрый вечер!', 'Good evening!')
const u5c = [
  it('всегда', 'always'),
  it('часто', 'often'),
  it('никогда', 'never'),
  it('работать', 'work'),
  it('отдыхать', 'rest'),
  it('выходные', 'weekend')
]
const s5_6 = sen('Я всегда пью чай утром.', 'I always drink tea in the morning.')
const s5_7 = sen('Он никогда не ест рыбу.', 'He never eats fish.')
const s5_8 = sen('По выходным я отдыхаю.', 'On weekends I rest.')
const u5d = [
  it('понедельник', 'Monday'),
  it('вторник', 'Tuesday'),
  it('среда', 'Wednesday'),
  it('пятница', 'Friday'),
  it('суббота', 'Saturday'),
  it('воскресенье', 'Sunday')
]
const s5_9 = sen('Сегодня понедельник.', 'Today is Monday.')
const s5_10 = sen('До встречи в субботу!', 'See you on Saturday!')
const s5_11 = sen('Вторник — хороший день.', 'Tuesday is a good day.')

const u6a = [
  it('путешествие', 'travel'),
  it('билет', 'ticket'),
  it('чемодан', 'suitcase'),
  it('карта', 'map'),
  it('паспорт', 'passport'),
  it('деньги', 'money')
]
const s6_1 = sen('Один билет, пожалуйста.', 'One ticket, please.')
const s6_2 = sen('Мой паспорт и деньги здесь.', 'My passport and money are here.')
const s6_3 = sen('Где мой чемодан?', 'Where is my suitcase?')
const u6b = [
  it('поезд', 'train'),
  it('самолёт', 'plane'),
  it('аэропорт', 'airport'),
  it('вокзал', 'station'),
  it('отель', 'hotel'),
  it('такси', 'taxi')
]
const s6_4 = sen('Поезд дешёвый, а самолёт дорогой.', 'The train is cheap, and the plane is expensive.')
const s6_5 = sen('Аэропорт большой.', 'The airport is big.')
const s6_6 = sen('Такси в отель, пожалуйста.', 'Taxi to the hotel, please.')
const u6c = [
  it('идти, ехать', 'go'),
  it('прямо', 'straight'),
  it('налево', 'left'),
  it('направо', 'right'),
  it('нужно', 'need'),
  it('помощь', 'help')
]
const s6_7 = sen('Идите прямо, пожалуйста.', 'Go straight, please.')
const s6_8 = sen('Помогите!', 'Help!')
const s6_9 = sen('Мне нужно такси.', 'I need a taxi.')
const u6d = [
  it('покупать', 'buy'),
  it('дорогой', 'expensive'),
  it('дешёвый', 'cheap'),
  it('багаж', 'luggage'),
  it('сувенир', 'souvenir'),
  it('открытка', 'postcard')
]
const s6_10 = sen('Я хочу купить карту.', 'I want to buy a map.')
const s6_11 = sen('Это очень дорого!', 'This is very expensive!')
const s6_12 = sen('Сувениры дешёвые.', 'Souvenirs are cheap.')

export const englishCourse: Course = {
  id: 'en',
  flag: '🇬🇧',
  name: 'English Flow',
  tagline: 'Английский с нуля: от «hello» до аэропорта',
  ttsLang: 'en-US',
  units: [
    unit('en', 'u1', 'Знакомство', 'Приветствия и первые фразы', '#58CC02', [
      {
        id: 'l1',
        title: 'Первые слова',
        items: [...u1a],
        build: (f) => [
          ...f.choiceNew(u1a),
          ...f.listenChoice(u1a.slice(0, 4)),
          ...f.match(u1a),
          ...f.wordbank([s1_1]),
          ...f.speak([{ t: 'bye', ru: 'пока' }])
        ]
      },
      {
        id: 'l2',
        title: 'Как дела?',
        items: [...u1b],
        build: (f) => [
          ...f.choiceNew(u1b),
          ...f.choiceRev(u1b.slice(0, 4)),
          ...f.wordbank([s1_2, s1_3]),
          ...f.typed([s1_4]),
          ...f.listenChoice(u1b.slice(2, 6)),
          ...f.fillSen([s1_4], 0)
        ]
      },
      {
        id: 'l3',
        title: 'Меня зовут…',
        items: [...u1c],
        build: (f) => [
          {
            kind: 'info',
            title: 'Глагол to be: am / is / are',
            body: [
              'В английском глагол «быть» нельзя пропустить: я есть, он есть, она есть.',
              'I am — я есть (я — …), he/she/it is — он/она есть, we/you/they are — мы/вы/они есть.'
            ],
            example: { t: 'I am Anna.', ru: 'Я Анна.' }
          },
          ...f.choiceNew(u1c),
          ...f.wordbank([s1_5, s1_6, s1_7]),
          ...f.match(u1c.slice(0, 4)),
          ...f.listenChoice(u1c.slice(3, 7))
        ]
      },
      {
        id: 'l4',
        title: 'Он, она, они',
        items: [...u1d],
        build: (f) => [
          {
            kind: 'info',
            title: 'Местоимения',
            body: ['I — я, he — он, she — она, we — мы, they — они.', 'He — про мужчин и мальчиков, she — про женщин и девочек.'],
            example: { t: 'She is a teacher.', ru: 'Она учитель.' }
          },
          ...f.choiceNew(u1d),
          f.fillRaw('She ', ' a teacher.', 'is', ['is', 'am', 'are'], 'She is — она есть'),
          f.fillRaw('I ', ' Anna.', 'am', ['is', 'am', 'are']),
          ...f.wordbank([s1_8, s1_9]),
          ...f.listenChoice(u1d.slice(0, 4)),
          ...f.typed([
            sen('Это мальчик.', 'This is a boy.')
          ])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Знакомство',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u1a, ...u1b, ...u1c, ...u1d],
        build: (f) =>
          bossMix(
            f,
            [u1a[0], u1a[4], u1b[2], u1b[4], u1c[0], u1c[3], u1c[6], u1d[0], u1d[2], u1d[5]],
            [s1_1, s1_2, s1_3, s1_5, s1_6, s1_7],
            [f.fillRaw('He ', ' my friend.', 'is', ['is', 'am', 'are'])]
          )
      }
    ]),
    unit('en', 'u2', 'Семья', 'Люди, которые рядом с тобой', '#1CB0F6', [
      {
        id: 'l1',
        title: 'Мама и папа',
        items: [...u2a],
        build: (f) => [
          ...f.choiceNew(u2a),
          ...f.listenChoice(u2a.slice(0, 5)),
          ...f.wordbank([s2_1, s2_2]),
          ...f.typed([sen('Я люблю сестру.', 'I love my sister.')]),
          ...f.match(u2a),
          ...f.speak([{ t: 'I love mom and dad.', ru: 'Я люблю маму и папу.' }])
        ]
      },
      {
        id: 'l2',
        title: 'Бабушка и дедушка',
        items: [...u2b],
        build: (f) => [
          ...f.choiceNew(u2b),
          ...f.choiceRev(u2b),
          ...f.listenChoice(u2b.slice(0, 4)),
          ...f.wordbank([s2_4, s2_5]),
          ...f.fillSen([s2_6], 0),
          ...f.match([...u2b, u2a[0], u2a[2]])
        ]
      },
      {
        id: 'l3',
        title: 'Мой, твой, его',
        items: [...u2c],
        build: (f) => [
          {
            kind: 'info',
            title: 'Притяжательные: my / your / his / her',
            body: ['my — мой, your — твой, his — его, her — её.', 'Перед существительным артикль уже не нужен: my mom, her dad.'],
            example: { t: 'Her sister is a teacher.', ru: 'Её сестра — учитель.' }
          },
          ...f.choiceNew(u2c),
          ...f.wordbank([s2_8, s2_9, s2_10]),
          f.fillRaw('Her sister ', ' a teacher.', 'is', ['is', 'are', 'am']),
          ...f.listenTyped([s2_11]),
          ...f.match(u2c)
        ]
      },
      {
        id: 'l4',
        title: 'Большая семья',
        items: [...u2d],
        build: (f) => [
          ...f.choiceNew(u2d),
          ...f.choiceRev(u2d.slice(0, 4)),
          ...f.wordbank([s2_11, s2_12]),
          ...f.listenChoice(u2d.slice(2, 6)),
          ...f.typed([s2_13]),
          ...f.match([...u2d.slice(0, 4), ...u2a.slice(0, 2)])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Семья',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u2a, ...u2b, ...u2c, ...u2d],
        build: (f) =>
          bossMix(
            f,
            [u2a[0], u2a[3], u2b[0], u2b[3], u2c[0], u2c[3], u2d[0], u2d[3], u2d[4]],
            [s2_1, s2_2, s2_8, s2_10, s2_11, s2_12],
            [f.fillRaw('His brother ', ' a student.', 'is', ['is', 'are'])]
          )
      }
    ]),
    unit('en', 'u3', 'Еда и напитки', 'Всё вкусное', '#FFC800', [
      {
        id: 'l1',
        title: 'Вода и хлеб',
        items: [...u3a],
        build: (f) => [
          ...f.choiceNew(u3a),
          ...f.choiceRev(u3a),
          ...f.listenChoice(u3a.slice(0, 5)),
          ...f.match(u3a),
          ...f.wordbank([s3_1]),
          ...f.speak([{ t: 'An apple, please.', ru: 'Яблоко, пожалуйста.' }])
        ]
      },
      {
        id: 'l2',
        title: 'Я хочу чай',
        items: [...u3b],
        build: (f) => [
          {
            kind: 'info',
            title: 'Present Simple: он/она + -s',
            body: ['После he/she/it к глаголу добавляется -s: I drink — он drinks.', 'Это правило работает почти со всеми глаголами.'],
            example: { t: 'She drinks coffee.', ru: 'Она пьёт кофе.' }
          },
          ...f.choiceNew(u3b),
          ...f.wordbank([s3_4, s3_5]),
          f.fillRaw('She ', ' coffee.', 'drinks', ['drink', 'drinks', 'to drink'], 'После she добавляем -s'),
          ...f.listenChoice(u3b.slice(0, 4)),
          ...f.typed([s3_7])
        ]
      },
      {
        id: 'l3',
        title: 'Завтрак',
        items: [...u3c],
        build: (f) => [
          ...f.choiceNew(u3c),
          ...f.listenChoice(u3c.slice(0, 5)),
          ...f.listenTyped([s3_8]),
          ...f.wordbank([s3_9]),
          ...f.match(u3c.slice(0, 4)),
          ...f.speak([{ t: 'Fish and rice, please.', ru: 'Рыбу и рис, пожалуйста.' }])
        ]
      },
      {
        id: 'l4',
        title: 'В кафе',
        items: [...u3d],
        build: (f) => [
          ...f.choiceNew(u3d),
          f.fillRaw('How much ', ' the bill?', 'is', ['is', 'are', 'am']),
          ...f.wordbank([s3_10, s3_12]),
          ...f.typed([s3_11]),
          ...f.listenChoice(u3d.slice(0, 4)),
          ...f.match([...u3d.slice(0, 4), ...u3a.slice(0, 2)])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Кафе',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u3a, ...u3b, ...u3c, ...u3d],
        build: (f) =>
          bossMix(
            f,
            [u3a[0], u3a[4], u3b[0], u3b[2], u3c[1], u3c[4], u3d[2], u3d[3], u3d[5]],
            [s3_1, s3_4, s3_6, s3_9, s3_10, s3_11],
            [f.fillRaw('The soup ', ' very tasty.', 'is', ['is', 'are'])]
          )
      }
    ]),
    unit('en', 'u4', 'Дом и город', 'Где ты живёшь', '#CE82FF', [
      {
        id: 'l1',
        title: 'Мой дом',
        items: [...u4a],
        build: (f) => [
          ...f.choiceNew(u4a),
          ...f.listenChoice(u4a.slice(0, 5)),
          ...f.wordbank([s4_1, s4_2]),
          ...f.typed([s4_3]),
          ...f.match(u4a),
          ...f.speak([{ t: 'I am at home.', ru: 'Я дома.' }])
        ]
      },
      {
        id: 'l2',
        title: 'Комната',
        items: [...u4b],
        build: (f) => [
          ...f.choiceNew(u4b),
          ...f.choiceRev(u4b),
          ...f.listenChoice(u4b.slice(0, 4)),
          ...f.wordbank([s4_4, s4_6]),
          ...f.fillSen([s4_5], 0),
          ...f.match([...u4b, ...u4a.slice(0, 2)])
        ]
      },
      {
        id: 'l3',
        title: 'В городе',
        items: [...u4c],
        build: (f) => [
          ...f.choiceNew(u4c),
          ...f.listenChoice(u4c.slice(0, 5)),
          ...f.wordbank([s4_7, s4_8]),
          ...f.typed([s4_9]),
          ...f.speak([{ t: 'Where is the school?', ru: 'Где школа?' }]),
          ...f.match(u4c)
        ]
      },
      {
        id: 'l4',
        title: 'Где ключи?',
        items: [...u4d],
        build: (f) => [
          {
            kind: 'info',
            title: 'Вопрос «Where is…?»',
            body: ['where — где, is — есть/находится.', 'Where is the school? — Где школа?', 'Ответ: It is here. — Она здесь.']
          },
          ...f.choiceNew(u4d),
          f.fillRaw('The book is ', ' the table.', 'on', ['on', 'in', 'under', 'at']),
          f.fillRaw('Where ', ' the keys?', 'are', ['is', 'are', 'am']),
          ...f.wordbank([s4_10, s4_11]),
          ...f.listenChoice(u4d.slice(3, 6)),
          ...f.match([...u4d, ...u4c.slice(0, 2)])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Дом и город',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u4a, ...u4b, ...u4c, ...u4d],
        build: (f) =>
          bossMix(
            f,
            [u4a[0], u4a[4], u4b[0], u4b[3], u4c[0], u4c[3], u4d[0], u4d[3], u4d[5]],
            [s4_1, s4_4, s4_7, s4_9, s4_10, s4_11],
            [f.fillRaw('The cat is ', ' the table.', 'under', ['on', 'in', 'under'])]
          )
      }
    ]),
    unit('en', 'u5', 'Время и дни', 'Каждый день по расписанию', '#FF9600', [
      {
        id: 'l1',
        title: 'Сегодня и завтра',
        items: [...u5a],
        build: (f) => [
          ...f.choiceNew(u5a),
          ...f.choiceRev(u5a),
          ...f.listenChoice(u5a.slice(0, 5)),
          ...f.wordbank([s5_1, s5_2]),
          ...f.typed([s5_3]),
          ...f.match(u5a)
        ]
      },
      {
        id: 'l2',
        title: 'Утро и вечер',
        items: [...u5b],
        build: (f) => [
          ...f.choiceNew(u5b),
          ...f.listenChoice(u5b.slice(0, 5)),
          ...f.wordbank([s5_4]),
          ...f.typed([s5_5]),
          ...f.fillSen([s5_4], 0),
          ...f.match(u5b)
        ]
      },
      {
        id: 'l3',
        title: 'Всегда и никогда',
        items: [...u5c],
        build: (f) => [
          {
            kind: 'info',
            title: 'Наречия частоты',
            body: ['always — всегда, often — часто, never — никогда.', 'В английском они стоят ПЕРЕД глаголом: I always drink tea.'],
            example: { t: 'I never eat fish.', ru: 'Я никогда не ем рыбу.' }
          },
          ...f.choiceNew(u5c),
          ...f.wordbank([s5_6, s5_7]),
          ...f.listenChoice(u5c.slice(0, 4)),
          ...f.typed([s5_8]),
          ...f.match([...u5c.slice(0, 4), ...u5a.slice(0, 2)])
        ]
      },
      {
        id: 'l4',
        title: 'Дни недели',
        items: [...u5d],
        build: (f) => [
          ...f.choiceNew(u5d),
          ...f.choiceRev(u5d.slice(0, 4)),
          ...f.wordbank([s5_9, s5_10]),
          ...f.listenChoice(u5d.slice(1, 5)),
          ...f.typed([s5_11]),
          ...f.speak([{ t: 'See you on Saturday!', ru: 'До встречи в субботу!' }])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Время',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u5a, ...u5b, ...u5c, ...u5d],
        build: (f) =>
          bossMix(
            f,
            [u5a[0], u5a[3], u5b[1], u5b[5], u5c[0], u5c[2], u5d[0], u5d[3], u5d[4]],
            [s5_1, s5_2, s5_6, s5_7, s5_9, s5_10],
            [f.fillRaw('I ', ' drink tea.', 'always', ['always', 'never', 'often'])]
          )
      }
    ]),
    unit('en', 'u6', 'В путь!', 'Путешествия и дорога', '#FF4B4B', [
      {
        id: 'l1',
        title: 'Билет и чемодан',
        items: [...u6a],
        build: (f) => [
          ...f.choiceNew(u6a),
          ...f.listenChoice(u6a.slice(0, 5)),
          ...f.wordbank([s6_1, s6_2]),
          ...f.typed([s6_3]),
          ...f.match(u6a),
          ...f.speak([{ t: 'One ticket, please.', ru: 'Один билет, пожалуйста.' }])
        ]
      },
      {
        id: 'l2',
        title: 'Поезд или самолёт?',
        items: [...u6b],
        build: (f) => [
          ...f.choiceNew(u6b),
          ...f.choiceRev(u6b),
          ...f.listenChoice(u6b.slice(0, 5)),
          ...f.wordbank([s6_4, s6_6]),
          ...f.typed([s6_5]),
          ...f.match(u6b)
        ]
      },
      {
        id: 'l3',
        title: 'Как пройти?',
        items: [...u6c],
        build: (f) => [
          {
            kind: 'info',
            title: 'Повелительное наклонение',
            body: ['Приказы и просьбы без «you»: Go straight. — Идите прямо.', 'Добавьте please, чтобы сделать вежливо: Help, please!'],
            example: { t: 'Go straight, please.', ru: 'Идите прямо, пожалуйста.' }
          },
          ...f.choiceNew(u6c),
          ...f.wordbank([s6_7, s6_9]),
          ...f.listenChoice(u6c.slice(0, 4)),
          ...f.typed([s6_8]),
          ...f.match([...u6c, ...u6b.slice(0, 2)])
        ]
      },
      {
        id: 'l4',
        title: 'Шопинг в дороге',
        items: [...u6d],
        build: (f) => [
          ...f.choiceNew(u6d),
          ...f.choiceRev(u6d.slice(0, 4)),
          ...f.wordbank([s6_10, s6_11]),
          ...f.listenChoice(u6d.slice(0, 4)),
          ...f.typed([s6_12]),
          ...f.match([...u6d.slice(0, 4), ...u6a.slice(0, 2)])
        ]
      },
      {
        id: 'boss',
        title: 'Финальный босс: Дорога',
        isBoss: true,
        timeLimitSec: 110,
        passScore: 11,
        items: [...u6a, ...u6b, ...u6c, ...u6d],
        build: (f) =>
          bossMix(
            f,
            [u6a[1], u6a[4], u6b[0], u6b[3], u6c[0], u6c[2], u6d[0], u6d[2], u6d[4]],
            [s6_1, s6_4, s6_7, s6_9, s6_10, s6_11],
            [
              f.fillRaw('I ', ' a taxi.', 'need', ['need', 'want', 'go']),
              f.fillRaw('Go ', ', please.', 'straight', ['straight', 'left', 'right'])
            ]
          )
      }
    ])
  ]
}
