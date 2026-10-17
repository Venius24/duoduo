import { bossMix, item, sen, unit } from './builders'
import type { Course } from './types'

const zh = (ru: string, t: string, roman: string) => item('zh', ru, t, roman)

const u1a = [
  zh('привет', '你好', 'nǐ hǎo'),
  zh('спасибо', '谢谢', 'xièxie'),
  zh('до свидания', '再见', 'zàijiàn'),
  zh('пожалуйста (в ответ)', '不客气', 'bú kèqi')
]
const u1b = [
  zh('я', '我', 'wǒ'),
  zh('ты', '你', 'nǐ'),
  zh('он', '他', 'tā'),
  zh('она', '她', 'tā'),
  zh('хороший', '好', 'hǎo'),
  zh('очень', '很', 'hěn'),
  zh('быть', '是', 'shì'),
  zh('нет, не', '不', 'bù')
]
const u1c = [
  zh('вопросительная частица 吗', '吗', 'ma'),
  zh('что', '什么', 'shénme'),
  zh('кто', '谁', 'shéi'),
  zh('это', '这', 'zhè')
]
const s1_1 = sen('Привет!', '你 好 ！', 'Nǐ hǎo!')
const s1_2 = sen('Как дела?', '你 好 吗 ？', 'Nǐ hǎo ma?')
const s1_3 = sen('У меня всё хорошо, спасибо!', '我 很 好 ， 谢 谢 ！', 'Wǒ hěn hǎo, xièxie!')
const s1_4 = sen('Я Анна.', '我 是 安娜 。', 'Wǒ shì Ānnà.')
const s1_5 = sen('Кто ты?', '你 是 谁 ？', 'Nǐ shì shéi?')
const s1_6 = sen('Что это?', '这 是 什么 ？', 'Zhè shì shénme?')
const s1_7 = sen('До свидания, друг!', '再 见 ， 朋友 ！', 'Zàijiàn, péngyou!')

const u2a = [
  zh('мама', '妈妈', 'māma'),
  zh('папа', '爸爸', 'bàba'),
  zh('старший брат', '哥哥', 'gēge'),
  zh('младший брат', '弟弟', 'dìdi'),
  zh('старшая сестра', '姐姐', 'jiějie'),
  zh('младшая сестра', '妹妹', 'mèimei')
]
const u2b = [
  zh('друг', '朋友', 'péngyou'),
  zh('учитель', '老师', 'lǎoshī'),
  zh('студент', '学生', 'xuésheng'),
  zh('врач', '医生', 'yīshēng'),
  zh('человек', '人', 'rén'),
  zh('мы', '我们', 'wǒmen'),
  zh('имя', '名字', 'míngzi'),
  zh('Китай', '中国', 'Zhōngguó')
]
const s2_1 = sen('Это моя мама.', '这 是 我 妈妈 。', 'Zhè shì wǒ māma.')
const s2_2 = sen('Он мой старший брат.', '他 是 我 哥哥 。', 'Tā shì wǒ gēge.')
const s2_3 = sen('Она учитель.', '她 是 老师 。', 'Tā shì lǎoshī.')
const s2_4 = sen('Я студент.', '我 是 学生 。', 'Wǒ shì xuésheng.')
const s2_5 = sen('Мы друзья.', '我们 是 朋友 。', 'Wǒmen shì péngyou.')
const s2_6 = sen('Папа — врач.', '爸爸 是 医生 。', 'Bàba shì yīshēng.')
const s2_7 = sen('Как тебя зовут?', '你 的 名字 是 什么 ？', 'Nǐ de míngzi shì shénme?')

const u3a = [
  zh('чай', '茶', 'chá'),
  zh('вода', '水', 'shuǐ'),
  zh('рис (варёный)', '米饭', 'mǐfàn'),
  zh('лапша', '面条', 'miàntiáo'),
  zh('яблоко', '苹果', 'píngguǒ'),
  zh('рыба', '鱼', 'yú')
]
const u3b = [
  zh('есть, кушать', '吃', 'chī'),
  zh('пить', '喝', 'hē'),
  zh('вкусный', '好吃', 'hǎochī'),
  zh('хотеть', '想', 'xiǎng'),
  zh('мясо', '肉', 'ròu'),
  zh('яйцо', '鸡蛋', 'jīdàn')
]
const s3_1 = sen('Я хочу выпить чаю.', '我 想 喝 茶 。', 'Wǒ xiǎng hē chá.')
const s3_2 = sen('Яблоки очень вкусные.', '苹果 很 好吃 。', 'Píngguǒ hěn hǎochī.')
const s3_3 = sen('Он ест рыбу.', '他 吃 鱼 。', 'Tā chī yú.')
const s3_4 = sen('Я покупаю лапшу.', '我 买 面条 。', 'Wǒ mǎi miàntiáo.')
const u3c = [
  zh('покупать', '买', 'mǎi'),
  zh('давать', '给', 'gěi'),
  zh('чашка, стакан', '杯', 'bēi'),
  zh('один (со счётным)', '一个', 'yí gè'),
  zh('два (со счётным)', '两个', 'liǎng gè'),
  zh('сколько денег', '多少钱', 'duōshǎo qián'),
  zh('это', '这个', 'zhège')
]
const s3_5 = sen('Дайте мне стакан воды, пожалуйста.', '请 给 我 一 杯 水 。', 'Qǐng gěi wǒ yì bēi shuǐ.')
const s3_6 = sen('Сколько это стоит?', '这个 多少钱 ？', 'Zhège duōshǎo qián?')

const u4a = [
  zh('один', '一', 'yī'),
  zh('два', '二', 'èr'),
  zh('три', '三', 'sān'),
  zh('четыре', '四', 'sì'),
  zh('пять', '五', 'wǔ'),
  zh('шесть', '六', 'liù'),
  zh('семь', '七', 'qī'),
  zh('восемь', '八', 'bā'),
  zh('девять', '九', 'jiǔ'),
  zh('десять', '十', 'shí')
]
const u4b = [
  zh('сегодня', '今天', 'jīntiān'),
  zh('завтра', '明天', 'míngtiān'),
  zh('вчера', '昨天', 'zuótiān'),
  zh('сейчас', '现在', 'xiànzài'),
  zh('утро', '早上', 'zǎoshang'),
  zh('вечер', '晚上', 'wǎnshang'),
  zh('неделя', '星期', 'xīngqī'),
  zh('работать', '工作', 'gōngzuò')
]
const s4_1 = sen('Который час?', '现在 几 点 ？', 'Xiànzài jǐ diǎn?')
const s4_2 = sen('Сейчас три часа.', '现在 三 点 。', 'Xiànzài sān diǎn.')
const s4_3 = sen('Сегодня понедельник.', '今天 星期一 。', 'Jīntiān xīngqīyī.')
const s4_4 = sen('Завтра я работаю.', '我 明天 工作 。', 'Wǒ míngtiān gōngzuò.')
const s4_5 = sen('Доброе утро!', '早 上 好 ！', 'Zǎoshang hǎo!')
const s4_6 = sen('Добрый вечер!', '晚 上 好 ！', 'Wǎnshang hǎo!')

const u5a = [
  zh('здесь', '这里', 'zhèlǐ'),
  zh('там', '那里', 'nàlǐ'),
  zh('где', '哪儿', 'nǎr'),
  zh('быть в, находиться', '在', 'zài'),
  zh('дом', '家', 'jiā')
]
const u5b = [
  zh('школа', '学校', 'xuéxiào'),
  zh('магазин', '商店', 'shāngdiàn'),
  zh('больница', '医院', 'yīyuàn'),
  zh('вокзал', '车站', 'chēzhàn'),
  zh('парк', '公园', 'gōngyuán')
]
const u5c = [
  zh('идти (куда-то)', '去', 'qù'),
  zh('приходить', '来', 'lái'),
  zh('возвращаться', '回', 'huí'),
  zh('впереди', '前面', 'qiánmiàn'),
  zh('сзади', '后面', 'hòumiàn'),
  zh('сверху, на', '上面', 'shàngmiàn'),
  zh('снизу, под', '下面', 'xiàmiàn')
]
const s5_1 = sen('Я дома.', '我 在 家 。', 'Wǒ zài jiā.')
const s5_2 = sen('Где школа?', '学校 在 哪儿 ？', 'Xuéxiào zài nǎr?')
const s5_3 = sen('Мама в магазине.', '妈妈 在 商店 。', 'Māma zài shāngdiàn.')
const s5_4 = sen('Мы едем в Китай!', '我们 去 中国 ！', 'Wǒmen qù Zhōngguó!')
const s5_5 = sen('Он приходит в школу.', '他 来 学校 。', 'Tā lái xuéxiào.')
const s5_6 = sen('Вокзал впереди.', '车站 在 前面 。', 'Chēzhàn zài qiánmiàn.')
const u5d = [
  zh('кошка', '猫', 'māo'),
  zh('стол', '桌子', 'zhuōzi'),
  zh('книга', '书', 'shū'),
  zh('дорога', '路', 'lù')
]
const s5_7 = sen('Кот под столом.', '猫 在 桌子 下面 。', 'Māo zài zhuōzi xiàmiàn.')

const u6a = [
  zh('пожалуйста (просьба)', '请', 'qǐng'),
  zh('извините', '对不起', 'duìbuqǐ'),
  zh('ничего страшного', '没关系', 'méi guānxi'),
  zh('понимать', '明白', 'míngbai')
]
const u6b = [
  zh('говорить', '说', 'shuō'),
  zh('медленно', '慢', 'màn'),
  zh('мочь, уметь', '会', 'huì'),
  zh('любить', '爱', 'ài'),
  zh('немного', '一点儿', 'yìdiǎnr'),
  zh('китайский язык', '中文', 'Zhōngwén')
]
const s6_1 = sen('Извините!', '对 不 起 ！', 'Duìbuqǐ!')
const s6_2 = sen('Ничего страшного!', '没 关系 ！', 'Méi guānxi!')
const s6_3 = sen('Я не понимаю.', '我 不 明白 。', 'Wǒ bù míngbai.')
const s6_4 = sen('Говорите, пожалуйста, помедленнее.', '请 说 慢 一点儿 。', 'Qǐng shuō màn yìdiǎnr.')
const s6_5 = sen('Ты говоришь по-китайски?', '你 会 说 中文 吗 ？', 'Nǐ huì shuō Zhōngwén ma?')
const s6_6 = sen('Да, я немного говорю.', '会 ， 我 会 说 一点儿 。', 'Huì, wǒ huì shuō yìdiǎnr.')
const s6_7 = sen('Я люблю тебя!', '我 爱 你 ！', 'Wǒ ài nǐ!')

export const chineseCourse: Course = {
  id: 'zh',
  flag: '🇨🇳',
  name: 'Путь дракона',
  tagline: 'Китайский с нуля: пиньинь, тоны и первые иероглифы',
  ttsLang: 'zh-CN',
  units: [
    unit('zh', 'u1', 'Nǐ hǎo! Первые слова', 'Приветствия, местоимения и тоны', '#58CC02', [
      {
        id: 'l1',
        title: 'Привет и пока',
        items: [...u1a],
        build: (f) => [
          ...f.choiceNew(u1a),
          ...f.listenChoice(u1a),
          ...f.match(u1a),
          ...f.wordbank([s1_1]),
          ...f.speak([{ t: '你好', ru: 'привет', roman: 'nǐ hǎo' }])
        ]
      },
      {
        id: 'l2',
        title: 'Я и ты',
        items: [...u1b],
        build: (f) => [
          {
            kind: 'info',
            title: 'Четыре тона',
            body: [
              'Один слог — разный смысл, всё решает тон.',
              'mā 妈 — мама, má 麻 — конопля, mǎ 马 — лошадь, mà 骂 — ругать.',
              'Тоны показываются чёрточками над гласной в пиньине.'
            ],
            example: { t: '你好', ru: 'привет', roman: 'nǐ hǎo — 3-й + 3-й тон' }
          },
          ...f.choiceNew(u1b.slice(0, 5)),
          ...f.choiceRev(u1b.slice(3, 8)),
          ...f.wordbank([s1_2, s1_3]),
          ...f.tone([u1a[0], u1a[1], u1b[4], u1b[6]]),
          ...f.listenChoice(u1b.slice(0, 4))
        ]
      },
      {
        id: 'l3',
        title: 'Вопросы',
        items: [...u1c],
        build: (f) => [
          {
            kind: 'info',
            title: 'Частица 吗 — простой вопрос',
            body: ['Добавь 吗 в конец фразы — получился вопрос «да/нет».', '你好。— Привет. → 你好吗？— Как дела?']
          },
          ...f.choiceNew(u1c),
          ...f.wordbank([s1_5, s1_6]),
          ...f.typed([sen('Я студент.', '我是学生。', 'Wǒ shì xuésheng.')]),
          ...f.listenTyped([s1_4]),
          ...f.tone([u1c[0], u1c[2], u1c[3], u1b[7]]),
          ...f.match([...u1c.slice(1, 4), u1b[0]])
        ]
      },
      {
        id: 'l4',
        title: 'Диалог: как дела?',
        items: [...u1b.slice(0, 4)],
        build: (f) => [
          ...f.wordbank([s1_2, s1_3, s1_7]),
          ...f.choiceRev(u1b),
          ...f.listenTyped([s1_5]),
          f.fillRaw('我 ', ' 安娜 。', '是', ['是', '不', '好', '很'], 'Wǒ shì Ànnà.'),
          ...f.speak([{ t: '你好吗？', ru: 'Как дела?', roman: 'nǐ hǎo ma?' }]),
          ...f.match(u1b.slice(4, 8))
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Nǐ hǎo!',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u1a, ...u1b, ...u1c],
        build: (f) =>
          bossMix(
            f,
            [u1a[0], u1a[2], u1b[0], u1b[4], u1b[6], u1c[0], u1c[2], u1c[3]],
            [s1_1, s1_2, s1_4, s1_5, s1_6, s1_7],
            [...f.tone([u1b[1], u1b[5]])]
          )
      }
    ]),
    unit('zh', 'u2', 'Семья и люди', 'Мама, папа и возрастные братья', '#1CB0F6', [
      {
        id: 'l1',
        title: 'Мама и папа',
        items: [...u2a],
        build: (f) => [
          ...f.choiceNew(u2a),
          ...f.listenChoice(u2a),
          ...f.tone(u2a.slice(0, 4)),
          ...f.wordbank([s2_1]),
          ...f.typed([sen('Это папа.', '这是爸爸。', 'Zhè shì bàba.')])
        ]
      },
      {
        id: 'l2',
        title: 'Старшие и младшие',
        items: [...u2b],
        build: (f) => [
          {
            kind: 'info',
            title: 'Братья: старшие и младшие',
            body: ['В китайском важно, старше человек или младше:', '哥哥 gēge — старший брат, 弟弟 dìdi — младший.', '姐姐 jiějie — старшая сестра, 妹妹 mèimei — младшая.']
          },
          ...f.choiceNew(u2b.slice(0, 5)),
          ...f.choiceRev(u2b.slice(3, 8)),
          ...f.listenChoice(u2b.slice(0, 5)),
          ...f.wordbank([s2_5]),
          ...f.match(u2b.slice(0, 4))
        ]
      },
      {
        id: 'l3',
        title: 'Профессии',
        items: [...u2b.slice(1, 5)],
        build: (f) => [
          ...f.choiceNew(u2b.slice(1, 5)),
          ...f.listenTyped([s2_6]),
          ...f.wordbank([s2_3, s2_4]),
          f.fillRaw('爸爸 是 ', ' 。', '医生', ['医生', '老师', '学生', '人'], 'Bàba shì yīshēng.'),
          ...f.tone([u2b[1], u2b[2], u2b[3]])
        ]
      },
      {
        id: 'l4',
        title: 'Это моя семья',
        items: [...u2a.slice(0, 2), ...u2b.slice(5, 8)],
        build: (f) => [
          ...f.choiceNew(u2b.slice(5, 8)),
          ...f.wordbank([s2_2, s2_7]),
          ...f.listenTyped([s2_1]),
          ...f.typed([sen('Мы друзья.', '我们是朋友。', 'Wǒmen shì péngyou.')]),
          ...f.speak([{ t: '我 是 学生 。', ru: 'Я студент.', roman: 'wǒ shì xuésheng' }]),
          ...f.match([...u2a.slice(2, 6)])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Семья',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u2a, ...u2b],
        build: (f) =>
          bossMix(
            f,
            [u2a[0], u2a[3], u2b[0], u2b[1], u2b[3], u2b[5], u2b[7]],
            [s2_1, s2_2, s2_4, s2_6, s2_7],
            [...f.tone([u2a[1], u2b[4]])]
          )
      }
    ]),
    unit('zh', 'u3', 'Есть и пить', 'Еда, напитки и «вкусно!»', '#FFC800', [
      {
        id: 'l1',
        title: 'Чай и вода',
        items: [...u3a],
        build: (f) => [
          ...f.choiceNew(u3a),
          ...f.choiceRev(u3a.slice(0, 5)),
          ...f.listenChoice(u3a),
          ...f.tone(u3a.slice(0, 5)),
          ...f.wordbank([sen('Я пью чай.', '我 喝 茶 。', 'Wǒ hē chá.')])
        ]
      },
      {
        id: 'l2',
        title: 'Вкусно!',
        items: [...u3b],
        build: (f) => [
          ...f.choiceNew(u3b),
          ...f.listenChoice(u3b.slice(0, 5)),
          ...f.wordbank([s3_2, s3_3]),
          ...f.typed([sen('Я хочу пить воду.', '我想喝水。', 'Wǒ xiǎng hē shuǐ.')]),
          ...f.match(u3b)
        ]
      },
      {
        id: 'l3',
        title: 'Хочу есть!',
        items: [...u3c.slice(0, 3)],
        build: (f) => [
          {
            kind: 'info',
            title: 'Хотеть: 想 и 要',
            body: ['想 xiǎng — хочу (мягкое желание): 我想喝茶.', '要 yào — хочу/буду (твёрже): 我要茶.'],
            example: { t: '我 想 喝 茶 。', ru: 'Я хочу выпить чаю.', roman: 'wǒ xiǎng hē chá' }
          },
          ...f.choiceNew(u3c.slice(0, 3)),
          ...f.wordbank([s3_1, s3_5]),
          ...f.listenTyped([s3_6]),
          ...f.tone([u3c[0], u3c[1], u3c[2]]),
          ...f.match(u3c.slice(0, 4))
        ]
      },
      {
        id: 'l4',
        title: 'На рынке',
        items: [...u3c.slice(3, 7), u3a[2]],
        build: (f) => [
          ...f.choiceNew(u3c.slice(3, 7)),
          ...f.choiceRev(u3c.slice(4, 7)),
          ...f.wordbank([s3_4, s3_6]),
          ...f.listenChoice([u3c[5], u3c[6], u3b[4], u3b[5]]),
          ...f.speak([{ t: '这个多少钱？', ru: 'Сколько это стоит?', roman: 'zhège duōshǎo qián' }]),
          ...f.match([...u3c.slice(3, 6), u3a[3]])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Ресторан',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u3a, ...u3b, ...u3c],
        build: (f) =>
          bossMix(
            f,
            [u3a[0], u3a[3], u3b[0], u3b[3], u3c[0], u3c[2], u3c[5]],
            [s3_1, s3_2, s3_3, s3_5, s3_6],
            [...f.tone([u3a[1], u3b[2]])]
          )
      }
    ]),
    unit('zh', 'u4', 'Числа и время', 'От 一 до 十 и дни недели', '#FF9600', [
      {
        id: 'l1',
        title: 'Считаем до десяти',
        items: [...u4a],
        build: (f) => [
          {
            kind: 'info',
            title: 'Тональное лото чисел',
            body: ['Следи за тонами: 一 yī (1-й), 二 èr (4-й), 三 sān (1-й).', '四 sì и 十 shí различаются только тоном — не перепутай!']
          },
          ...f.choiceNew(u4a.slice(0, 6)),
          ...f.choiceRev(u4a.slice(4, 10)),
          ...f.listenChoice(u4a.slice(0, 6)),
          ...f.tone(u4a.slice(0, 8)),
          ...f.match(u4a.slice(0, 4))
        ]
      },
      {
        id: 'l2',
        title: 'Сегодня, завтра, вчера',
        items: [...u4b.slice(0, 4)],
        build: (f) => [
          ...f.choiceNew(u4b.slice(0, 4)),
          ...f.listenChoice(u4b.slice(0, 4)),
          ...f.wordbank([s4_4]),
          ...f.typed([sen('Сегодня понедельник.', '今天 星期一 。', 'Jīntiān xīngqīyī.')]),
          ...f.tone(u4b.slice(0, 3))
        ]
      },
      {
        id: 'l3',
        title: 'Утро и вечер',
        items: [...u4b.slice(4, 8)],
        build: (f) => [
          ...f.choiceNew(u4b.slice(4, 8)),
          ...f.wordbank([s4_5, s4_6]),
          ...f.listenTyped([s4_1]),
          ...f.typed([sen('Сейчас три часа.', '现在三点。', 'Xiànzài sān diǎn.')]),
          ...f.match([...u4b.slice(4, 8)])
        ]
      },
      {
        id: 'l4',
        title: 'Время идёт',
        items: [...u4a.slice(0, 3), ...u4b.slice(0, 4)],
        build: (f) => [
          ...f.wordbank([s4_2, s4_3]),
          ...f.listenTyped([s4_2]),
          f.fillRaw('现在 ', ' 点 。', '三', ['三', '二', '十', '一'], 'Xiànzài sān diǎn.'),
          ...f.speak([{ t: '现在几点？', ru: 'Который час?', roman: 'xiànzài jǐ diǎn' }]),
          ...f.tone([u4b[6], u4b[7]])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Время',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u4a, ...u4b],
        build: (f) =>
          bossMix(
            f,
            [u4a[0], u4a[4], u4a[9], u4b[0], u4b[3], u4b[6]],
            [s4_1, s4_2, s4_3, s4_4, s4_5],
            [...f.tone([u4a[1], u4a[7]])]
          )
      }
    ]),
    unit('zh', 'u5', 'Место и движение', 'Где я и куда иду', '#CE82FF', [
      {
        id: 'l1',
        title: 'Здесь и там',
        items: [...u5a],
        build: (f) => [
          {
            kind: 'info',
            title: 'Конструкция 在 + место',
            body: ['Подлежащее + 在 + место = кто-то где-то находится.', '我在家。— Я дома.', 'Вопрос: …在哪儿？— Где…?']
          },
          ...f.choiceNew(u5a),
          ...f.listenChoice(u5a),
          ...f.wordbank([s5_1]),
          ...f.typed([sen('Где школа?', '学校在哪儿？', 'Xuéxiào zài nǎr?')]),
          ...f.tone(u5a)
        ]
      },
      {
        id: 'l2',
        title: 'Город',
        items: [...u5b],
        build: (f) => [
          ...f.choiceNew(u5b),
          ...f.choiceRev(u5b),
          ...f.listenChoice(u5b.slice(0, 4)),
          ...f.wordbank([s5_3]),
          ...f.match(u5b)
        ]
      },
      {
        id: 'l3',
        title: 'Идти и ехать',
        items: [...u5c],
        build: (f) => [
          ...f.choiceNew(u5c.slice(0, 4)),
          ...f.listenChoice(u5c.slice(0, 5)),
          ...f.wordbank([s5_4, s5_6]),
          ...f.tone([u5c[0], u5c[1], u5c[3]]),
          ...f.match(u5c.slice(2, 6))
        ]
      },
      {
        id: 'l4',
        title: 'Где кот?',
        items: [...u5d],
        build: (f) => [
          ...f.choiceNew(u5d),
          ...f.wordbank([s5_2, s5_5, s5_7]),
          ...f.listenTyped([s5_7]),
          f.fillRaw('猫 在 桌子 ', ' 。', '下面', ['下面', '上面', '前面', '后面'], 'Māo zài zhuōzi xiàmiàn.'),
          ...f.match([...u5d, u5c[4]])
        ]
      },
      {
        id: 'boss',
        title: 'Босс: Дорога',
        isBoss: true,
        timeLimitSec: 100,
        passScore: 10,
        items: [...u5a, ...u5b, ...u5c, ...u5d],
        build: (f) =>
          bossMix(
            f,
            [u5a[0], u5a[3], u5b[0], u5b[3], u5c[0], u5c[3], u5d[0]],
            [s5_1, s5_2, s5_4, s5_5, s5_7],
            [...f.tone([u5b[1], u5c[4]])]
          )
      }
    ]),
    unit('zh', 'u6', 'Вежливые слова', 'Извини, пойми, помоги', '#FF4B4B', [
      {
        id: 'l1',
        title: 'Спасибо и извините',
        items: [...u6a],
        build: (f) => [
          ...f.choiceNew(u6a),
          ...f.listenChoice(u6a),
          ...f.wordbank([s6_1, s6_2]),
          ...f.typed([s6_3]),
          ...f.tone(u6a)
        ]
      },
      {
        id: 'l2',
        title: 'Понимать и говорить',
        items: [...u6b.slice(0, 4)],
        build: (f) => [
          {
            kind: 'info',
            title: '会 — мочь, уметь',
            body: ['会 huì — умение, которому научился.', '我会说中文。— Я умею говорить по-китайски.']
          },
          ...f.choiceNew(u6b.slice(0, 4)),
          ...f.wordbank([s6_4]),
          ...f.listenTyped([s6_5]),
          ...f.tone(u6b.slice(0, 3)),
          ...f.match(u6b.slice(0, 4))
        ]
      },
      {
        id: 'l3',
        title: 'Любовь и дружба',
        items: [...u6b.slice(4, 6), u2b[0]],
        build: (f) => [
          ...f.choiceNew(u6b.slice(4, 6)),
          ...f.wordbank([s6_7]),
          ...f.speak([{ t: '我爱你！', ru: 'Я люблю тебя!', roman: 'wǒ ài nǐ' }]),
          ...f.typed([sen('Ты мой друг.', '你是我的朋友。', 'Nǐ shì wǒ de péngyou.')]),
          ...f.tone([u6b[4], u6b[5]])
        ]
      },
      {
        id: 'l4',
        title: 'Важные фразы',
        items: [...u6b],
        build: (f) => [
          ...f.wordbank([s6_5, s6_6]),
          ...f.listenTyped([s6_4]),
          f.fillRaw('我 会 说 ', ' 。', '中文', ['中文', '人', '好', '茶'], 'Wǒ huì shuō Zhōngwén.'),
          ...f.choiceRev(u6b.slice(1, 6)),
          ...f.match([...u6b.slice(0, 4)])
        ]
      },
      {
        id: 'boss',
        title: 'Драконий босс 🐉',
        isBoss: true,
        timeLimitSec: 110,
        passScore: 11,
        items: [...u6a, ...u6b],
        build: (f) =>
          bossMix(
            f,
            [u6a[0], u6a[2], u6b[0], u6b[2], u6b[3], u6b[5]],
            [s6_1, s6_3, s6_5, s6_6, s6_7],
            [...f.tone([u6b[1], u6b[4]])]
          )
      }
    ])
  ]
}
