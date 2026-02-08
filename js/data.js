/**
 * 租房大冒险 - 游戏数据
 */

const GAME_DATA = {
    // 事件池
    events: {
        // ========== 找房篇 ==========
        1001: {
            id: 1001,
            chapter: "finding",
            text: "你拖着行李箱站在地铁口，手机上的租房App弹出一条消息：\n\n「阳光大床房，近地铁，仅需800/月！」\n\n这价格...在这个城市简直像做梦。",
            scene: "subway",
            options: [
                { text: "📱 立刻联系房东", next: 1002 },
                { text: "🔍 继续刷其他房源", next: 1003 },
                { text: "🗣️ 问旁边的大爷附近房租行情", check: "charisma", difficulty: 40, success: 1004, fail: 1005 }
            ]
        },
        1002: {
            id: 1002,
            chapter: "finding",
            text: "你拨通了电话，对面传来一个油腻的声音：\n\n「嗨～亲，我是金牌中介小王！那套房子呢，今天刚好有人退租，你要不要现在就来看？就在xxx小区。」\n\n语速飞快，不给你思考时间。",
            scene: "phone",
            options: [
                { text: "🏃 马上去看房", next: 1010 },
                { text: "🤔 先问清楚详细情况", check: "charisma", difficulty: 50, success: 1006, fail: 1007 },
                { text: "📞 挂断电话，太可疑了", next: 1003 }
            ]
        },
        1003: {
            id: 1003,
            chapter: "finding",
            text: "你继续刷着手机，眼前闪过各种房源：\n\n有的照片明显P过，有的价格高得离谱，有的描述写着「仅限女生/情侣」...\n\n刷了半小时，你觉得脖子有点酸。",
            scene: "street",
            effects: { energy: -1 },
            options: [
                { text: "💪 继续刷，不信找不到好房", next: 1008 },
                { text: "☕ 先找个咖啡店坐下来慢慢找", next: 1009, effects: { money: -1 } },
                { text: "📱 回头联系刚才那个800的房子", next: 1002 }
            ]
        },
        1004: {
            id: 1004,
            chapter: "finding",
            text: "大爷热情地拉着你的手：\n\n「年轻人，这附近最便宜也得1500！800块？那八成是隔断间或者地下室！我跟你说，前面巷子里有个阿婆自己出租，价格公道...」\n\n大爷掏出一张皱巴巴的纸条递给你。",
            scene: "street",
            effects: { charisma: 1 },
            gainItem: "granny_note",
            options: [
                { text: "📝 收好纸条，去找阿婆", next: 1011 },
                { text: "🙏 谢过大爷，还是先看看800的房子", next: 1002 },
                { text: "📱 同时记下两个联系方式", next: 1010, effects: { charisma: 1 } }
            ]
        },
        1005: {
            id: 1005,
            chapter: "finding",
            text: "大爷警惕地看了你一眼：\n\n「问什么问！你是不是中介派来探价的？走走走！」\n\n你被大爷的气势吓退，灰溜溜地走了。看来搭话技巧还需要提升啊...",
            scene: "street",
            effects: { mood: -1 },
            options: [
                { text: "😤 自己找！打开手机继续刷", next: 1003 },
                { text: "📞 联系那个800的房源", next: 1002 }
            ]
        },
        1006: {
            id: 1006,
            chapter: "finding",
            text: "你冷静地连问了几个关键问题：朝向、楼层、是否隔断...\n\n中介小王明显慌了：「那个...其实是一个隔断的次卧啦，但空间很大的！」\n\n果然有猫腻！还好你问了。",
            scene: "phone",
            effects: { charisma: 1, mood: 1 },
            options: [
                { text: "🙅 果断拒绝隔断间", next: 1003 },
                { text: "💰 问问能不能再便宜点", check: "charisma", difficulty: 60, success: 1012, fail: 1013 },
                { text: "👀 反正便宜，去看看也无妨", next: 1010 }
            ]
        },
        1007: {
            id: 1007,
            chapter: "finding",
            text: "你支支吾吾地问了几个问题，但中介小王话术太熟练，三两句就把你绕晕了：\n\n「放心放心！都是正规房源！你来看了就知道！」\n\n挂了电话你还是一头雾水。",
            scene: "phone",
            effects: { mood: -1 },
            options: [
                { text: "🏃 算了，去看看吧", next: 1010 },
                { text: "🔍 继续找其他房源", next: 1003 }
            ]
        },
        1008: {
            id: 1008,
            chapter: "finding",
            text: "功夫不负有心人！你发现了一个看起来靠谱的房源：\n\n「合租·温馨两居·真实图片·1200/月·押一付一」\n\n评论区有人说房东是个和蔼的退休阿姨。",
            scene: "street",
            effects: { mood: 1 },
            options: [
                { text: "📞 赶紧联系！", next: 1011 },
                { text: "🕵️ 先去实地考察一下周边环境", check: "handy", difficulty: 35, success: 1014, fail: 1015 }
            ]
        },
        1009: {
            id: 1009,
            chapter: "finding",
            text: "你走进一家咖啡店，要了杯最便宜的美式。\n\n正当你低头刷手机时，邻桌有人在打电话：\n「...对，那个房子空了三个月了，房东急着租出去，你去砍砍价肯定能便宜...」\n\n你竖起了耳朵。",
            scene: "coffee",
            options: [
                { text: "👂 假装去倒水，靠近偷听地址", check: "charisma", difficulty: 45, success: 1016, fail: 1017 },
                { text: "🗣️ 直接搭话问情况", check: "charisma", difficulty: 55, success: 1016, fail: 1017 },
                { text: "📱 算了，继续自己找", next: 1008 }
            ]
        },
        // ========== 看房/签约过渡 ==========
        1010: {
            id: 1010,
            chapter: "finding",
            text: "你按照地址找到了小区。\n\n一个穿着花格子衬衫、头发梳得油亮的年轻人已经在门口等你了，胸前挂着「金牌经纪人」的工牌。\n\n「来来来，跟我上楼！你运气好，这套房抢手得很！」",
            scene: "building",
            options: [
                { text: "🚶 跟着上楼看房", next: 2001 },
                { text: "📋 先要求看看房屋的证件", check: "charisma", difficulty: 50, success: 1018, fail: 1019 },
                { text: "😨 感觉不对劲，找个借口溜了", next: 1003, effects: { mood: -1 } }
            ]
        },
        1011: {
            id: 1011,
            chapter: "finding",
            text: "你拨通了号码，接电话的是一位嗓音温柔的阿婆：\n\n「哦～找房子呀！我这有个小单间，干净的呢！1100一个月，你来看看嘛。就在幸福路18号。」\n\n听起来很靠谱！",
            scene: "phone",
            effects: { mood: 1 },
            options: [
                { text: "🏠 马上去幸福路看房", next: 2010 },
                { text: "💬 多问问房子的情况", next: 1020 }
            ]
        },
        1012: {
            id: 1012,
            chapter: "finding",
            text: "你施展了砍价大法！中介小王犹豫了一下：\n\n「好吧好吧...600一个月行不行？不能再低了！」\n\n虽然是隔断间，但这价格确实诱人...",
            scene: "phone",
            effects: { charisma: 1 },
            options: [
                { text: "✅ 成交！这价格不看白不看", next: 1010 },
                { text: "🙅 再便宜也不要隔断间", next: 1003 }
            ]
        },
        1013: {
            id: 1013,
            chapter: "finding",
            text: "中介小王坚定地说：\n\n「800已经是友情价了！这个价格你在全城都找不到第二套！你不要有的是人要！」\n\n感觉在被PUA...",
            scene: "phone",
            effects: { mood: -1 },
            options: [
                { text: "😤 不租就不租！", next: 1003 },
                { text: "😓 那...我去看看吧", next: 1010 }
            ]
        },
        1014: {
            id: 1014,
            chapter: "finding",
            text: "你仔细观察了周边环境：\n\n✅ 距离地铁站步行8分钟\n✅ 楼下有超市和菜市场\n✅ 小区看起来管理不错\n⚠️ 不过隔壁在施工，可能会有噪音\n\n整体来说还可以！",
            scene: "street",
            effects: { handy: 1, mood: 1 },
            options: [
                { text: "📞 满意！联系房东看房", next: 1011 },
                { text: "🏗️ 施工噪音是个问题，再找找", next: 1003 }
            ]
        },
        1015: {
            id: 1015,
            chapter: "finding",
            text: "你在小区附近转了转，但方向感不太好，绕了半天也没找到小区大门在哪...\n\n最后还是靠导航才找到。体力消耗不少。",
            scene: "street",
            effects: { energy: -1 },
            options: [
                { text: "📞 算了直接联系房东吧", next: 1011 },
                { text: "🔍 换个房源继续找", next: 1003 }
            ]
        },
        1016: {
            id: 1016,
            chapter: "finding",
            text: "你成功听到了关键信息！\n\n那个人说的是「阳光花园小区3号楼」，房东姓李，因为出国急租。\n\n这可能是个捡漏的好机会！",
            scene: "coffee",
            effects: { charisma: 1 },
            gainItem: "secret_address",
            options: [
                { text: "🏃 立刻去阳光花园看看", next: 2010 },
                { text: "📱 先在网上查查这个小区", next: 1008 }
            ]
        },
        1017: {
            id: 1017,
            chapter: "finding",
            text: "对方发现你在偷听，不悦地瞪了你一眼，起身换了个位置。\n\n尴尬到脚趾抠地...还是喝完咖啡走吧。",
            scene: "coffee",
            effects: { mood: -2 },
            options: [
                { text: "😣 灰溜溜离开咖啡店", next: 1003 },
                { text: "📱 假装若无其事继续刷手机", next: 1008 }
            ]
        },
        1018: {
            id: 1018,
            chapter: "finding",
            text: "中介被你的专业态度镇住了，乖乖掏出房产证复印件和委托书。\n\n你仔细查看，发现一切手续齐全。\n\n「看吧看吧，我们可是正规中介！」小王拍着胸脯说。",
            scene: "building",
            effects: { charisma: 1, mood: 1 },
            options: [
                { text: "👌 手续没问题，上楼看房", next: 2001 }
            ]
        },
        1019: {
            id: 1019,
            chapter: "finding",
            text: "中介小王笑着打哈哈：\n\n「证件什么的等签合同的时候再看嘛！先看房先看房！」\n\n一边说一边推着你往楼里走...",
            scene: "building",
            options: [
                { text: "🚶 被推着上楼了...", next: 2001, effects: { mood: -1 } },
                { text: "✋ 坚持要先看证件", check: "charisma", difficulty: 65, success: 1018, fail: 2001 }
            ]
        },
        1020: {
            id: 1020,
            chapter: "finding",
            text: "阿婆耐心地告诉你：\n\n「房子是朝南的，有个小阳台可以晒衣服。就是楼层高了点，6楼没电梯。但是锻炼身体嘛！」\n\n听起来除了没电梯其他都不错。",
            scene: "phone",
            options: [
                { text: "🏠 6楼算什么！去看房", next: 2010 },
                { text: "😓 6楼没电梯...算了吧", next: 1003, effects: { energy: -1 } }
            ]
        },

        // ========== 签约篇 ==========
        2001: {
            id: 2001,
            chapter: "signing",
            text: "推开门的瞬间，你惊呆了：\n\n这哪是什么「阳光大床房」！分明是用石膏板隔出来的一个小格子，窗户对着隔壁楼的墙，采光约等于零。\n\n角落里还摆着上个租客留下的旧床垫，散发着一股说不清的味道...",
            scene: "room_bad",
            effects: { mood: -2 },
            options: [
                { text: "🤬 这跟照片差太远了！要求退中介费", check: "charisma", difficulty: 55, success: 2002, fail: 2003 },
                { text: "😔 虽然差，但便宜啊...先将就住？", next: 2004 },
                { text: "🚪 扭头就走，浪费时间！", next: 1003 }
            ]
        },
        2002: {
            id: 2002,
            chapter: "signing",
            text: "你义正辞严地拿出手机对着房间一顿拍：\n\n「这和你发的照片完全不符！虚假宣传懂吗？我要投诉！」\n\n小王脸色变了：「别别别...看房费我不收了行吧？要不我再带你看套好的？」",
            scene: "room_bad",
            effects: { charisma: 1, mood: 1, money: 1 },
            options: [
                { text: "👌 那你带我看看好的房子", next: 2010 },
                { text: "👋 不用了，我自己找", next: 1003 }
            ]
        },
        2003: {
            id: 2003,
            chapter: "signing",
            text: "小王一脸无辜：\n\n「照片都是实拍的呀！可能是上个租客刚搬走还没收拾。你要不满意可以走，看房费不退哦～」\n\n气得你说不出话...",
            scene: "room_bad",
            effects: { mood: -1, money: -1 },
            options: [
                { text: "😤 认栽走人", next: 1003 },
                { text: "📋 记住这个中介，以后投诉他", next: 1003, gainItem: "agent_evidence" }
            ]
        },
        2004: {
            id: 2004,
            chapter: "signing",
            text: "你决定将就。小王立刻掏出一摞合同：\n\n「来来来签个字就好了！押一付三，服务费半个月租金。」\n\n合同密密麻麻的小字看得你头晕...",
            scene: "contract",
            options: [
                { text: "📝 仔细阅读每一条", check: "handy", difficulty: 45, success: 2005, fail: 2006 },
                { text: "✍️ 算了，直接签吧", next: 2006 },
                { text: "📱 拍照发给懂法律的朋友看看", next: 2007, effects: { energy: -1 } }
            ]
        },
        2005: {
            id: 2005,
            chapter: "signing",
            text: "你逐条仔细阅读，发现了几个坑：\n\n❌ 提前退租扣两个月押金\n❌ 物业费、取暖费全部租客承担\n❌ 维修费用500以下租客自理\n\n还好你看仔细了！",
            scene: "contract",
            effects: { handy: 1 },
            gainItem: "contract_knowledge",
            options: [
                { text: "🗣️ 要求修改不合理条款", check: "charisma", difficulty: 60, success: 2008, fail: 2009 },
                { text: "🚪 条款太坑，不租了", next: 1003, effects: { mood: 1 } },
                { text: "📝 记录下来，以后当证据", next: 2006, gainItem: "contract_photo" }
            ]
        },
        2006: {
            id: 2006,
            chapter: "signing",
            text: "你稀里糊涂地签了合同...\n\n小王笑得合不拢嘴：「欢迎入住！钥匙给你，有什么事随时联系~」\n\n看着手里的钥匙，你有种上了贼船的感觉。\n\n不管怎样，你终于有个窝了！",
            scene: "contract",
            effects: { money: -3, mood: -1 },
            addBuff: { id: "bad_contract", name: "霸王合同", desc: "签了不利合同，维修费自理", duration: -1, effect: { money: -1 } },
            options: [
                { text: "🏠 进入新家，开始新生活！", next: 3001 }
            ]
        },
        2007: {
            id: 2007,
            chapter: "signing",
            text: "你的朋友秒回消息：\n\n「这合同坑爹啊！提前退租要扣两个月押金，还有好几条明显违法。千万别签原版的！要求他们改！」\n\n还好问了朋友！",
            scene: "contract",
            effects: { mood: 1 },
            gainItem: "contract_knowledge",
            options: [
                { text: "🗣️ 拿着朋友的分析去谈判", check: "charisma", difficulty: 45, success: 2008, fail: 2009 },
                { text: "🚪 太多坑了，不租了", next: 1003 }
            ]
        },
        2008: {
            id: 2008,
            chapter: "signing",
            text: "你据理力争，逐条反驳不合理条款。\n\n小王被你的专业度震惊了：「好好好，这几条我们可以改...」\n\n最终你成功删除了最坑的几条，签了个相对公平的合同！",
            scene: "contract",
            effects: { charisma: 1, money: -2, mood: 2 },
            addBuff: { id: "fair_contract", name: "公平合同", desc: "签了合理合同，权益有保障", duration: -1, effect: {} },
            options: [
                { text: "🏠 搬进新家！", next: 3001 }
            ]
        },
        2009: {
            id: 2009,
            chapter: "signing",
            text: "小王态度强硬：「这是公司统一合同，一个字都不能改！不满意你可以不租。」\n\n你看看时间，已经找了一整天房子了...",
            scene: "contract",
            effects: { mood: -1, energy: -1 },
            options: [
                { text: "😮‍💨 算了，认了，签吧", next: 2006 },
                { text: "💪 不签！继续找其他的", next: 1003, effects: { mood: 1 } }
            ]
        },
        2010: {
            id: 2010,
            chapter: "signing",
            text: "你来到了幸福路18号。\n\n开门的是一位笑眯眯的阿婆。房间虽然不大但干净整洁，阳台上还养着几盆花。\n\n「你看看喜不喜欢？我不收中介费的，直接跟我签就好。」",
            scene: "room_good",
            effects: { mood: 2 },
            options: [
                { text: "😍 太好了！立刻签约！", next: 2011 },
                { text: "💬 能便宜点吗？", check: "charisma", difficulty: 50, success: 2012, fail: 2013 },
                { text: "🔍 先仔细检查一下房子", check: "handy", difficulty: 40, success: 2014, fail: 2011 }
            ]
        },
        2011: {
            id: 2011,
            chapter: "signing",
            text: "阿婆拿出一份简单的租房合同，条款清晰合理。\n\n「押一付一就好了，有什么问题随时找我，我就住楼下。」\n\n签好合同，拿到钥匙。你终于有个温暖的小窝了！",
            scene: "room_good",
            effects: { money: -2, mood: 2 },
            addBuff: { id: "kind_landlord", name: "慈祥房东", desc: "房东阿婆人很好，心情+1", duration: -1, effect: { mood: 1 } },
            options: [
                { text: "🏠 开始新生活！", next: 3001 }
            ]
        },
        2012: {
            id: 2012,
            chapter: "signing",
            text: "阿婆想了想：\n\n「你这孩子会说话！好吧，1000一个月，不能再少了。不过你要帮我偶尔浇浇花哦～」\n\n成功砍价100！",
            scene: "room_good",
            effects: { charisma: 1, money: 1, mood: 1 },
            options: [
                { text: "🤝 成交！签合同", next: 2011 }
            ]
        },
        2013: {
            id: 2013,
            chapter: "signing",
            text: "阿婆摇摇头：\n\n「1100已经很便宜啦！外面都要1500呢。不过你要是住满一年，最后一个月免租金。」\n\n嗯，也不错。",
            scene: "room_good",
            options: [
                { text: "👌 好的，就这个价", next: 2011 },
                { text: "🤔 我再看看别的", next: 1003 }
            ]
        },
        2014: {
            id: 2014,
            chapter: "signing",
            text: "你仔细检查了水电、门窗、热水器：\n\n✅ 水管正常\n✅ 电路完好\n⚠️ 热水器有点旧，但还能用\n✅ 门锁灵敏\n\n你还发现了一个小问题：窗户密封条有点老化。于是指出来让阿婆记在合同里。",
            scene: "room_good",
            effects: { handy: 1 },
            gainItem: "wrench",
            options: [
                { text: "✅ 检查完毕，放心签约", next: 2011 }
            ]
        },

        // ========== 居住篇 ==========
        3001: {
            id: 3001,
            chapter: "living",
            text: "搬家第一天。你终于安顿好了行李。\n\n正准备休息，突然听到门外有人按门铃。\n\n打开门，一个扎着马尾的女孩笑着说：\n「嗨！我是你隔壁的室友小林！欢迎入住～要不要一起吃个饭？」",
            scene: "hallway",
            options: [
                { text: "😊 好啊！正好还没吃饭", next: 3002, effects: { mood: 1 } },
                { text: "😅 谢谢，但我想先整理一下", next: 3003 },
                { text: "🗣️ 聊聊这栋楼有什么要注意的", check: "charisma", difficulty: 30, success: 3004, fail: 3002 }
            ]
        },
        3002: {
            id: 3002,
            chapter: "living",
            text: "你和小林去楼下的麻辣烫店吃了一顿。\n\n她告诉你，这栋楼的Wi-Fi密码是「88888888」，垃圾要分类，还有——\n\n「三楼的那个大叔有点怪，总是半夜在走廊走来走去，你别害怕就好。」",
            scene: "restaurant",
            effects: { mood: 1, money: -1 },
            options: [
                { text: "😨 半夜走来走去？什么情况？", next: 3005 },
                { text: "🤗 回家休息吧，明天还要上班", next: 3006 }
            ]
        },
        3003: {
            id: 3003,
            chapter: "living",
            text: "你礼貌地谢过小林，关上门继续整理。\n\n当你打开水龙头准备洗把脸时——\n\n「噗嗤！」\n\n水管爆了！水花四处飞溅！",
            scene: "room",
            effects: { mood: -2 },
            options: [
                { text: "🔧 赶紧自己修！", check: "handy", difficulty: 50, success: 3007, fail: 3008 },
                { text: "📞 打电话叫房东/维修工", next: 3009 },
                { text: "🏃 冲出去找隔壁小林帮忙", next: 3010 }
            ]
        },
        3004: {
            id: 3004,
            chapter: "living",
            text: "小林热情地跟你分享了各种情报：\n\n🔑 快递放在楼下超市代收\n🔑 热水器别开太大，会跳闸\n🔑 WiFi密码：88888888\n🔑 物业电话贴在电梯里\n🔑 三楼大叔人其实不错，就是作息特别...\n\n这些信息太有用了！",
            scene: "hallway",
            effects: { charisma: 1, mood: 1 },
            gainItem: "neighbor_info",
            options: [
                { text: "🍜 一起去吃个饭吧", next: 3002 },
                { text: "👋 谢过小林，回去整理房间", next: 3003 }
            ]
        },
        3005: {
            id: 3005,
            chapter: "living",
            text: "小林压低声音说：\n\n「听说那个大叔是个夜班程序员，不过有人说他半夜会对着墙壁自言自语...\n\n之前有个租客说听到他房间传出敲打声，第二天就搬走了。」\n\n你感觉背后发凉...",
            scene: "restaurant",
            effects: { mood: -1 },
            addBuff: { id: "night_worry", name: "深夜恐惧", desc: "对三楼大叔的恐惧", duration: 3, effect: { mood: -1 } },
            options: [
                { text: "😱 以后晚上一定要锁好门", next: 3006 },
                { text: "🤔 改天去跟大叔聊聊", next: 3006, effects: { mood: 1 } }
            ]
        },
        3006: {
            id: 3006,
            chapter: "living",
            text: "新家的第一个夜晚。\n\n你躺在床上，听着窗外偶尔传来的车声，想着接下来的日子。\n\n突然——「咚...咚...咚...」\n\n有规律的敲墙声从隔壁传来...",
            scene: "room_night",
            options: [
                { text: "🤜 敲回去！", check: "energy", difficulty: 40, success: 3011, fail: 3012 },
                { text: "😴 戴上耳塞睡觉", next: 3013, needItem: "earplugs" },
                { text: "🔍 贴着墙仔细听", check: "handy", difficulty: 35, success: 3014, fail: 3012 }
            ]
        },
        3007: {
            id: 3007,
            chapter: "living",
            text: "你冲到水管前，凭着以前看过的维修视频，先关掉了总阀门，然后用毛巾缠住破裂处。\n\n叮！你发现床底下有前租客留下的一套工具！\n\n简单修补后，水管不漏了。你真是个维修天才！",
            scene: "room",
            effects: { handy: 2, mood: 1 },
            gainItem: "toolkit",
            options: [
                { text: "💪 不错，以后自己修东西没问题了", next: 3006 }
            ]
        },
        3008: {
            id: 3008,
            chapter: "living",
            text: "你手忙脚乱地尝试修理，但越修越漏...\n\n水已经淹到了脚踝。你的行李箱和一堆衣服都泡了水。\n\n最后只好先关了总阀门，但房间已经一片狼藉。",
            scene: "room",
            effects: { mood: -2, energy: -1 },
            options: [
                { text: "📞 赶紧打电话叫维修", next: 3009 },
                { text: "😭 坐在湿漉漉的地板上发呆", next: 3009, effects: { mood: -1 } }
            ]
        },
        3009: {
            id: 3009,
            chapter: "living",
            text: "你拨通了维修电话。\n\n「哦，水管坏了？最快明天下午才能来。上门费50。」\n\n今晚只能先凑合了... 你用盆接住滴水，铺了层报纸在地上。",
            scene: "room",
            effects: { money: -1, energy: -1 },
            options: [
                { text: "😮‍💨 算了，先睡吧", next: 3006 }
            ]
        },
        3010: {
            id: 3010,
            chapter: "living",
            text: "小林拿着自己的工具盒过来了：\n\n「我以前在老家经常修这些！让我来！」\n\n三下五除二就把水管修好了。你感激涕零。",
            scene: "room",
            effects: { mood: 2 },
            addBuff: { id: "good_neighbor", name: "好邻居", desc: "和小林成为朋友", duration: -1, effect: { mood: 1 } },
            options: [
                { text: "🙏 谢谢小林！改天请你吃饭", next: 3006 }
            ]
        },
        3011: {
            id: 3011,
            chapter: "living",
            text: "你鼓起勇气用力敲了回去：「咚咚咚！」\n\n对面安静了几秒，然后传来一个低沉的声音：\n\n「...不好意思，在挂画框。」\n\n原来只是邻居在钉钉子啊！虚惊一场。",
            scene: "room_night",
            effects: { energy: 1, mood: 1 },
            options: [
                { text: "😌 放心睡觉", next: 3015 }
            ]
        },
        3012: {
            id: 3012,
            chapter: "living",
            text: "你在黑暗中辗转反侧，敲墙声时断时续...\n\n不知过了多久，你终于因为太困睡着了。\n\n第二天醒来，黑眼圈重得像被人打了一拳。",
            scene: "room_night",
            effects: { energy: -2, mood: -1 },
            options: [
                { text: "☀️ 拖着疲惫的身体开始新一天", next: 3015 }
            ]
        },
        3013: {
            id: 3013,
            chapter: "living",
            text: "你塞上隔音耳塞，世界瞬间清静了。\n\n在这个属于你的小窝里，你安心地进入了梦乡。\n\n明天又是新的一天！",
            scene: "room_night",
            effects: { mood: 1, energy: 1 },
            options: [
                { text: "☀️ 精神饱满地醒来", next: 3015 }
            ]
        },
        3014: {
            id: 3014,
            chapter: "living",
            text: "你贴着墙仔细听，发现敲击声很有规律，而且还伴随着隐约的...电钻声？\n\n突然你注意到墙角有一道细缝——这面墙好像不是承重墙，是后来隔出来的！\n\n你发现了一个「隐藏隔断」的秘密！",
            scene: "room_night",
            effects: { handy: 1 },
            gainItem: "wall_secret",
            options: [
                { text: "🔦 明天白天再来仔细研究", next: 3015 },
                { text: "🛏️ 先睡觉，管不了那么多", next: 3015 }
            ]
        },
        3015: {
            id: 3015,
            chapter: "living",
            text: "新的一天开始了！☀️\n\n你看了看手机，有几件事需要处理。阳光从窗户洒进来，照在你的小窝里。\n\n今天想要做什么呢？",
            scene: "room_morning",
            options: [
                { text: "🏪 去附近的二手市场淘点家具", next: 3016 },
                { text: "🔧 检查一下房间里的设备", check: "handy", difficulty: 40, success: 3017, fail: 3018 },
                { text: "🐛 等等...墙角那个是不是蟑螂？！", next: 3019 },
                { text: "📦 整理行李，找找有什么有用的东西", next: 3020 }
            ]
        },
        3016: {
            id: 3016,
            chapter: "living",
            text: "二手市场真是个宝藏！\n\n到处都是搬家甩卖的家具和电器。你在一堆旧货中翻翻找找...",
            scene: "market",
            options: [
                { text: "💡 买个二手台灯（花费1财力）", next: 3021, effects: { money: -1 }, gainItem: "desk_lamp" },
                { text: "🪑 买把还不错的椅子（花费2财力）", next: 3021, effects: { money: -2, mood: 1 } },
                { text: "🗣️ 跟老板砍个价", check: "charisma", difficulty: 45, success: 3022, fail: 3023 },
                { text: "👀 只看不买，记下有什么好东西", next: 3015, effects: { mood: 1 } }
            ]
        },
        3017: {
            id: 3017,
            chapter: "living",
            text: "你仔细检查了所有设备：\n\n🔧 发现热水器的一个螺丝松了——拧紧！\n🔧 空调滤网好脏——拆下来洗了\n🔧 阳台排水口堵了——清理干净\n\n一番折腾后，房间的设备状态好多了！",
            scene: "room",
            effects: { handy: 1, mood: 1 },
            options: [
                { text: "💪 还有什么要做的？", next: 3015 }
            ]
        },
        3018: {
            id: 3018,
            chapter: "living",
            text: "你尝试检查热水器，结果不小心碰到了一个开关——\n\n「砰！」跳闸了！整个房间一片漆黑。\n\n你摸黑找了半天才找到配电箱... 以后还是叫专业人士吧。",
            scene: "room",
            effects: { energy: -1, mood: -1 },
            options: [
                { text: "😫 算了，做点别的吧", next: 3015 }
            ]
        },
        3019: {
            id: 3019,
            chapter: "living",
            text: "一只巨大的蟑螂正大摇大摆地在墙角散步！\n\n你的全身寒毛都竖起来了！！！\n\n它似乎还在朝你这边爬过来！！",
            scene: "room",
            effects: { mood: -2 },
            options: [
                { text: "🩴 用拖鞋拍死它！", check: "handy", difficulty: 50, success: 3024, fail: 3025 },
                { text: "🏃 尖叫着冲出房间", next: 3026, effects: { mood: -1 } },
                { text: "🧴 喷杀虫剂！", next: 3027, needItem: "bug_spray" }
            ]
        },
        3020: {
            id: 3020,
            chapter: "living",
            text: "你翻找行李箱，在夹层里发现了几件有用的东西：\n\n妈妈偷偷塞的红包（增加财力）和一盒万能胶。",
            scene: "room",
            effects: { money: 2, mood: 1 },
            gainItem: "super_glue",
            options: [
                { text: "❤️ 谢谢妈妈！继续安顿", next: 3015 }
            ]
        },
        3021: {
            id: 3021,
            chapter: "living",
            text: "不错的收获！二手市场果然是租房族的好朋友。\n\n扛着战利品回到家，房间看起来更像样了。",
            scene: "room",
            effects: { mood: 1 },
            options: [
                { text: "😊 继续改善小窝", next: 3015 }
            ]
        },
        3022: {
            id: 3022,
            chapter: "living",
            text: "你发挥砍价天赋：「老板，这个台灯和那把椅子一起拿，能便宜不？」\n\n老板爽快地说：「两个一起30块拿走！」\n\n原价至少要50！赚到了！",
            scene: "market",
            effects: { charisma: 1, mood: 2 },
            gainItem: "desk_lamp",
            options: [
                { text: "🎉 满载而归！", next: 3021 }
            ]
        },
        3023: {
            id: 3023,
            chapter: "living",
            text: "老板一脸不耐烦：「二手货还砍什么价！一口价，爱买不买！」\n\n砍价失败...看来还需要修炼。",
            scene: "market",
            effects: { mood: -1 },
            options: [
                { text: "💰 原价买吧", next: 3021, effects: { money: -1 }, gainItem: "desk_lamp" },
                { text: "🚶 不买了，空手回去", next: 3015 }
            ]
        },
        3024: {
            id: 3024,
            chapter: "living",
            text: "你深呼一口气，瞄准蟑螂——\n\n「啪！」一击命中！\n\n蟑螂被消灭了！虽然拖鞋上的残骸有点恶心，但你成功保卫了自己的领地！",
            scene: "room",
            effects: { handy: 1, mood: 2 },
            options: [
                { text: "🦸 我就是蟑螂终结者！", next: 3015 }
            ]
        },
        3025: {
            id: 3025,
            chapter: "living",
            text: "你挥舞着拖鞋打了个空！\n\n蟑螂以不可思议的速度窜进了床底下...\n\n今晚你知道有一只蟑螂在床下，但你找不到它。细思恐极。",
            scene: "room",
            effects: { mood: -2 },
            addBuff: { id: "roach_fear", name: "蟑螂恐惧症", desc: "知道床下有蟑螂", duration: 3, effect: { mood: -1 } },
            options: [
                { text: "😰 今晚开着灯睡...", next: 3015 }
            ]
        },
        3026: {
            id: 3026,
            chapter: "living",
            text: "你惊叫着冲出房间，差点撞到路过的小林。\n\n「怎么了怎么了？」\n「蟑...蟑螂！！！」\n\n小林淡定地拿了张纸巾走进去，三秒钟后出来：「搞定了。」\n\n你的英雄小林又一次拯救了你。",
            scene: "hallway",
            effects: { mood: 1 },
            options: [
                { text: "🙏 小林真是我的救星", next: 3015 }
            ]
        },
        3027: {
            id: 3027,
            chapter: "living",
            text: "你掏出杀虫剂对准蟑螂一通猛喷！\n\n蟑螂挣扎了几下，翻了个白肚皮。\n\n虽然房间里现在全是杀虫剂的味道，但至少问题解决了！",
            scene: "room",
            effects: { mood: 1 },
            loseItem: "bug_spray",
            options: [
                { text: "🪟 开窗通风，继续生活", next: 3015 }
            ]
        },

        // ========== BOSS战：黑心中介 ==========
        9001: {
            id: 9001,
            chapter: "boss_agent",
            isBoss: true,
            bossName: "黑心中介",
            text: "【BOSS战：黑心中介小王！】\n\n就在你以为生活步入正轨时，中介小王突然上门：\n\n「亲～合同该续签了！不过呢，这次条件要稍微调整一下...」\n\n他掏出一份新合同，笑容让你后背发凉。\n\n【合同谈判战 - 第1轮】",
            scene: "contract",
            bossRound: 1,
            bossMaxRound: 5,
            bossSuccessCount: 0,
            bossSuccessNeed: 3,
            options: [
                { text: "🗣️ 用口才驳斥", check: "charisma", difficulty: 50, success: 9010, fail: 9020 },
                { text: "💰 花钱妥协", next: 9030, effects: { money: -2 } },
                { text: "📜 使用「模糊合同」", next: 9040, needItem: "fuzzy_contract" }
            ]
        },
        9010: {
            id: 9010,
            chapter: "boss_agent",
            isBoss: true,
            text: "你据理力争：「这条完全不合理！租赁法明确规定...」\n\n小王被你的气势震住了：「好好好，这条可以商量...」\n\n✅ 成功反驳！",
            scene: "contract",
            effects: { charisma: 1 },
            bossSuccess: true,
            options: [
                { text: "➡️ 继续下一轮", nextBossRound: true }
            ]
        },
        9020: {
            id: 9020,
            chapter: "boss_agent",
            isBoss: true,
            text: "小王摇头晃脑：「这位租客你不懂行情啊～现在房租都涨了，我给你的价格已经很优惠了！」\n\n你被他的话术绕晕了...\n\n❌ 驳斥失败，签下一条不利条款！",
            scene: "contract",
            effects: { money: -1, mood: -1 },
            options: [
                { text: "➡️ 继续下一轮", nextBossRound: true }
            ]
        },
        9030: {
            id: 9030,
            chapter: "boss_agent",
            isBoss: true,
            text: "你无奈地掏出钱包：「行吧行吧，这条我认了...」\n\n小王笑得更欢了：「哎呀亲太爽快了！」\n\n💸 花钱消灾，但你的财力减少了。",
            scene: "contract",
            options: [
                { text: "➡️ 继续下一轮", nextBossRound: true }
            ]
        },
        9040: {
            id: 9040,
            chapter: "boss_agent",
            isBoss: true,
            text: "你掏出之前收集到的「模糊合同」证据：\n\n「小王啊，你看看你上次给我签的这份合同，好几条都违法呢～\n要不要我把这个发到网上大家评评理？」\n\n小王脸色一变：「别别别！这轮算你过！」\n\n✅ 道具效果显著！",
            scene: "contract",
            effects: { mood: 2 },
            loseItem: "fuzzy_contract",
            bossSuccess: true,
            options: [
                { text: "➡️ 继续下一轮", nextBossRound: true }
            ]
        },

        // Boss战中间轮次模板
        9050: {
            id: 9050,
            chapter: "boss_agent",
            isBoss: true,
            bossRound: "current",
            text: "小王翻到下一页：\n\n「还有这条——以后每月物业费由你承担，水电费涨价20%。怎么样？」\n\n看他那得意的样子，你真想把合同扔他脸上。",
            scene: "contract",
            options: [
                { text: "🗣️ 用口才驳斥", check: "charisma", difficulty: 55, success: 9010, fail: 9020 },
                { text: "💰 花钱妥协", next: 9030, effects: { money: -2 } },
                { text: "📋 搬出法律条文", check: "handy", difficulty: 50, success: 9010, fail: 9020 }
            ]
        },
        9051: {
            id: 9051,
            chapter: "boss_agent",
            isBoss: true,
            bossRound: "current",
            text: "小王又抛出一个霸王条款：\n\n「押金从一个月涨到三个月，你觉得没问题吧？」\n\n这简直是趁火打劫！",
            scene: "contract",
            options: [
                { text: "🗣️ 这违反规定！", check: "charisma", difficulty: 50, success: 9010, fail: 9020 },
                { text: "💰 忍了，交钱", next: 9030, effects: { money: -3 } },
                { text: "📞 威胁要打12315投诉", check: "charisma", difficulty: 60, success: 9010, fail: 9020 }
            ]
        },
        9052: {
            id: 9052,
            chapter: "boss_agent",
            isBoss: true,
            bossRound: "current",
            text: "小王开始使出最后的杀手锏：\n\n「这个房子现在很多人想要的，你不续签可以，但押金我是不退的哦～」\n\n这是赤裸裸的威胁！",
            scene: "contract",
            options: [
                { text: "🗣️ 押金必须退！这是法律规定！", check: "charisma", difficulty: 55, success: 9010, fail: 9020 },
                { text: "💰 认了...", next: 9030, effects: { money: -2 } },
                { text: "📱 录音取证！", check: "handy", difficulty: 45, success: 9060, fail: 9020 }
            ]
        },
        9060: {
            id: 9060,
            chapter: "boss_agent",
            isBoss: true,
            text: "你假装低头看手机，其实偷偷开了录音！\n\n「你刚才说押金不退？我录到了哦～」\n\n小王傻眼了：「你...你！好吧好吧，这条算了...」\n\n✅ 关键证据到手！",
            scene: "contract",
            effects: { handy: 1, mood: 2 },
            bossSuccess: true,
            gainItem: "agent_recording",
            options: [
                { text: "➡️ 继续下一轮", nextBossRound: true }
            ]
        },

        // Boss战胜利/失败
        9100: {
            id: 9100,
            chapter: "boss_agent",
            text: "🎉 【BOSS战胜利！】\n\n经过激烈的谈判，你成功击退了黑心中介小王！\n\n新合同的条款基本合理，你保住了自己的权益。\n\n小王灰溜溜地走了，临走前还不忘说：「下次续签再说...」\n\n但你知道，他再也不敢轻易坑你了！",
            scene: "room",
            effects: { charisma: 2, mood: 3, money: 2 },
            gainItem: "negotiation_exp",
            options: [
                { text: "💪 继续我的租房生活！", next: 3015 }
            ]
        },
        9101: {
            id: 9101,
            chapter: "boss_agent",
            text: "💀 【BOSS战失败...】\n\n你没能撑过小王的连环话术轰炸。\n\n新合同里全是霸王条款，你的财力大幅减少，还得承受各种附加费用...\n\n但至少你还有个地方住。吃一堑长一智吧。",
            scene: "contract",
            effects: { money: -3, mood: -3 },
            addBuff: { id: "bad_contract_v2", name: "超级霸王合同", desc: "合同条款极其不利", duration: -1, effect: { money: -2 } },
            options: [
                { text: "😔 含泪继续生活...", next: 3015 }
            ]
        },

        // ========== BOSS战：终极房东大妈 ==========
        9200: {
            id: 9200,
            chapter: "boss_landlord",
            isBoss: true,
            bossName: "终极房东大妈",
            text: "【最终BOSS：终极房东大妈！】\n\n租约到期了。房东大妈来做退房检查。\n\n她推开门，戴着老花镜，手里拿着一个小本本，眼神犀利如鹰。\n\n「来，我们一项一项检查。先看——墙面！」\n\n【退房检查战 - 第1项：墙面】\n怒气值：⬜⬜⬜⬜⬜",
            scene: "room_check",
            bossRound: 1,
            bossRage: 0,
            bossMaxRage: 5,
            options: [
                { text: "🔧 用动手技能修补墙面", check: "handy", difficulty: 50, success: 9210, fail: 9220 },
                { text: "🗣️ 用口才解释", check: "charisma", difficulty: 55, success: 9210, fail: 9220 },
                { text: "🎨 使用道具「全新墙漆」", next: 9230, needItem: "wall_paint" }
            ]
        },
        9210: {
            id: 9210,
            chapter: "boss_landlord",
            isBoss: true,
            text: "房东大妈推了推眼镜：\n\n「嗯...还可以，这面墙保持得不错。」\n\n✅ 墙面检查通过！",
            scene: "room_check",
            effects: { mood: 1 },
            bossCheckPass: true,
            options: [
                { text: "➡️ 下一项检查", nextBossCheck: true }
            ]
        },
        9220: {
            id: 9220,
            chapter: "boss_landlord",
            isBoss: true,
            text: "房东大妈的眼睛瞪大了：\n\n「这是什么！墙上怎么有划痕！你知不知道补一面墙要多少钱？！」\n\n她在小本本上重重地记了一笔。\n\n❌ 墙面检查失败！怒气+1",
            scene: "room_check",
            effects: { mood: -1, money: -1 },
            bossRagePlus: 1,
            options: [
                { text: "➡️ 下一项检查", nextBossCheck: true }
            ]
        },
        9230: {
            id: 9230,
            chapter: "boss_landlord",
            isBoss: true,
            text: "你提前准备了一桶和原来一模一样的墙漆，把所有痕迹都盖住了！\n\n房东大妈仔细看了半天：「嗯，这面墙跟新的一样嘛！不错不错。」\n\n✅ 完美通过！",
            scene: "room_check",
            effects: { mood: 2 },
            loseItem: "wall_paint",
            bossCheckPass: true,
            options: [
                { text: "➡️ 下一项检查", nextBossCheck: true }
            ]
        },

        // 第二项检查：家具
        9240: {
            id: 9240,
            chapter: "boss_landlord",
            isBoss: true,
            text: "房东大妈走到桌子前，用手指划过桌面：\n\n「家具呢？让我看看这些桌椅有没有损坏。」\n\n她弯腰检查桌腿、椅子和衣柜...\n\n【退房检查 - 第2项：家具】",
            scene: "room_check",
            options: [
                { text: "🔧 提前修好了所有损坏", check: "handy", difficulty: 55, success: 9210, fail: 9220 },
                { text: "🗣️ 这些磨损是正常使用痕迹", check: "charisma", difficulty: 50, success: 9210, fail: 9220 },
                { text: "🔨 使用「万能扳手」加固", next: 9250, needItem: "wrench" }
            ]
        },
        9250: {
            id: 9250,
            chapter: "boss_landlord",
            isBoss: true,
            text: "你之前就用万能扳手把所有松动的螺丝都拧紧了，桌椅稳固如新！\n\n房东大妈试着摇了摇桌子：「嗯，比我当初买的时候还结实！」\n\n✅ 家具检查完美通过！",
            scene: "room_check",
            effects: { mood: 2, handy: 1 },
            loseItem: "wrench",
            bossCheckPass: true,
            options: [
                { text: "➡️ 下一项检查", nextBossCheck: true }
            ]
        },

        // 第三项检查：卫生
        9260: {
            id: 9260,
            chapter: "boss_landlord",
            isBoss: true,
            text: "房东大妈最后走进卫生间和厨房：\n\n「最后看看卫生情况...」\n\n她打开灶台、检查排水口、看了看马桶...\n\n【退房检查 - 第3项：卫生】",
            scene: "room_check",
            options: [
                { text: "🧹 我可是提前大扫除了", check: "energy", difficulty: 45, success: 9210, fail: 9220 },
                { text: "🗣️ 我一直保持得很干净的", check: "charisma", difficulty: 60, success: 9210, fail: 9220 },
                { text: "✨ 使用「专业清洁套装」", next: 9270, needItem: "cleaning_kit" }
            ]
        },
        9270: {
            id: 9270,
            chapter: "boss_landlord",
            isBoss: true,
            text: "你之前花钱买了专业清洁套装，把房子里里外外打扫得一尘不染！\n\n房东大妈简直不敢相信：「这...比我原来打扫得还干净！」\n\n✅ 卫生检查完美通过！",
            scene: "room_check",
            effects: { mood: 3 },
            loseItem: "cleaning_kit",
            bossCheckPass: true,
            options: [
                { text: "➡️ 等待最终结果", next: 9300 }
            ]
        },

        // 最终结算
        9300: {
            id: 9300,
            chapter: "boss_landlord",
            text: "房东大妈合上小本本，推了推眼镜，看着你...",
            scene: "room_check",
            isBossResult: true,
            options: []
        },
        9301: {
            id: 9301,
            chapter: "boss_landlord",
            text: "🎉🎉🎉 【最终BOSS战胜利！】\n\n房东大妈露出了罕见的微笑：\n\n「不错不错！你是我见过最靠谱的租客！押金全额退还！」\n\n她从口袋里掏出一个红包：「这是额外的奖励，下次有好房子第一个通知你！」\n\n🏆 恭喜你成功保住了全部押金！\n租房大冒险——通关！",
            scene: "room_check",
            effects: { money: 5, mood: 5 },
            isEnding: true,
            endingType: "victory",
            options: [
                { text: "🎊 查看最终评分", next: "ending" }
            ]
        },
        9302: {
            id: 9302,
            chapter: "boss_landlord",
            text: "😤 【最终BOSS战失败...】\n\n房东大妈怒气冲天：\n\n「看看你把房子糟蹋成什么样！押金全部扣除！还要额外赔偿！」\n\n你含泪掏出了最后的积蓄...\n\n不过，这次的经验教训一定会让你下次做得更好！\n\n租房大冒险——结束。",
            scene: "room_check",
            effects: { money: -5, mood: -3 },
            isEnding: true,
            endingType: "defeat",
            options: [
                { text: "📊 查看最终评分", next: "ending" }
            ]
        },

        // ========== 游戏结束 ==========
        "ending": {
            id: "ending",
            text: "ENDING",
            isEnding: true,
            options: []
        }
    },

    // 道具定义
    items: {
        granny_note: { name: "阿婆的纸条", desc: "上面写着幸福路18号的电话", icon: "📝" },
        secret_address: { name: "神秘地址", desc: "咖啡店偷听到的房源信息", icon: "🏠" },
        earplugs: { name: "隔音耳塞", desc: "能屏蔽大部分噪音", icon: "🔇" },
        wrench: { name: "万能扳手", desc: "动手能力+加成，可用于BOSS战", icon: "🔧" },
        toolkit: { name: "维修工具箱", desc: "前租客留下的工具，动手+2", icon: "🧰" },
        wall_secret: { name: "隔断秘密", desc: "你发现了墙壁的秘密", icon: "🧱" },
        neighbor_info: { name: "邻居情报", desc: "小林分享的各种有用信息", icon: "📋" },
        contract_knowledge: { name: "合同知识", desc: "了解了合同中的坑", icon: "📜" },
        contract_photo: { name: "合同照片", desc: "拍下了不合理条款作为证据", icon: "📸" },
        agent_evidence: { name: "中介黑料", desc: "记录了中介的不当行为", icon: "📝" },
        fuzzy_contract: { name: "模糊合同", desc: "可在中介BOSS战中使用", icon: "📄" },
        agent_recording: { name: "录音证据", desc: "中介威胁的录音", icon: "🎙️" },
        negotiation_exp: { name: "谈判经验", desc: "战胜中介获得的经验", icon: "🏅" },
        super_glue: { name: "万能胶", desc: "修补东西的好帮手", icon: "🧴" },
        desk_lamp: { name: "二手台灯", desc: "虽然旧但还亮", icon: "💡" },
        wall_paint: { name: "全新墙漆", desc: "可用于房东BOSS战", icon: "🎨" },
        cleaning_kit: { name: "专业清洁套装", desc: "可用于房东BOSS战", icon: "✨" },
        bug_spray: { name: "杀虫喷雾", desc: "对蟑螂特攻", icon: "🧴" }
    },

    // Boss战中间轮次的事件ID列表
    bossAgentRounds: [9050, 9051, 9052],
    bossLandlordChecks: [9240, 9260],

    // 触发BOSS战的条件：完成一定数量的居住篇事件后
    bossAgentTriggerCount: 6,
    bossLandlordTriggerCount: 12,

    // 角色立绘配置
    characters: {
        old_man: { name: "和善老头", image: "asset/pawn/和善老头.jpeg" },
        landlord_lady: { name: "房东大妈", image: "asset/pawn/房东大妈.jpeg" },
        agent: { name: "中介小哥", image: "asset/pawn/中介小哥.jpeg" },
        roommate: { name: "热情室友", image: "asset/pawn/热情室友.jpeg" },
        otaku: { name: "死宅室友", image: "asset/pawn/死宅室友.jpeg" },
        strict_landlord: { name: "严厉房东", image: "asset/pawn/严厉房东.jpeg" },
        staff: { name: "公寓员工", image: "asset/pawn/公寓员工.jpeg" },
    },

    // 事件对应的角色立绘映射
    eventCharacters: {
        // 和善老头 - 大爷
        1004: "old_man",
        1005: "old_man",
        // 中介小哥 - 中介小王
        1002: "agent",
        1006: "agent",
        1007: "agent",
        1010: "agent",
        1012: "agent",
        1013: "agent",
        1018: "agent",
        1019: "agent",
        2001: "agent",
        2002: "agent",
        2003: "agent",
        2004: "agent",
        2005: "agent",
        2006: "agent",
        2007: "agent",
        2008: "agent",
        2009: "agent",
        // 房东大妈 - 阿婆
        1011: "landlord_lady",
        1020: "landlord_lady",
        2010: "landlord_lady",
        2011: "landlord_lady",
        2012: "landlord_lady",
        2013: "landlord_lady",
        2014: "landlord_lady",
        // 热情室友 - 小林
        3001: "roommate",
        3002: "roommate",
        3004: "roommate",
        3005: "roommate",
        3010: "roommate",
        3026: "roommate",
        // 公寓员工 - 维修工
        3009: "staff",
        // Boss战 - 中介小王
        9001: "agent",
        9010: "agent",
        9020: "agent",
        9030: "agent",
        9040: "agent",
        9050: "agent",
        9051: "agent",
        9052: "agent",
        9060: "agent",
        9100: "agent",
        9101: "agent",
        // Boss战 - 房东大妈（严厉版本）
        9200: "strict_landlord",
        9210: "strict_landlord",
        9220: "strict_landlord",
        9230: "strict_landlord",
        9240: "strict_landlord",
        9250: "strict_landlord",
        9260: "strict_landlord",
        9270: "strict_landlord",
        9300: "strict_landlord",
        9301: "strict_landlord",
        9302: "strict_landlord",
    },

    // 场景配色
    sceneColors: {
        subway: { bg: 0x2c3e50, accent: 0xe74c3c },
        phone: { bg: 0x1a1a2e, accent: 0x16213e },
        street: { bg: 0x87ceeb, accent: 0x2ecc71 },
        coffee: { bg: 0x8b4513, accent: 0xdaa520 },
        building: { bg: 0x7f8c8d, accent: 0x95a5a6 },
        room_bad: { bg: 0x4a4a4a, accent: 0xc0392b },
        room_good: { bg: 0xffeaa7, accent: 0xfdcb6e },
        room: { bg: 0x2d3436, accent: 0x636e72 },
        room_night: { bg: 0x0c0c1d, accent: 0x2c3e50 },
        room_morning: { bg: 0xffeaa7, accent: 0xf39c12 },
        contract: { bg: 0x2c3e50, accent: 0xe74c3c },
        hallway: { bg: 0x636e72, accent: 0xdfe6e9 },
        restaurant: { bg: 0xd63031, accent: 0xff7675 },
        market: { bg: 0xe17055, accent: 0xfab1a0 },
        room_check: { bg: 0x6c5ce7, accent: 0xa29bfe }
    }
};
