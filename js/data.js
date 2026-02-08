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
            text: "你拖着行李箱站在上海地铁2号线出口，梅雨季节的空气潮湿闷热。手机上的租房App弹出一条消息：\n\n「静安寺朝南一室户，近地铁，仅需800/月！」\n\n这价格...在魔都简直像做梦。",
            scene: "subway",
            options: [
                { text: "📱 立刻联系房东", next: 1002 },
                { text: "🔍 继续刷其他房源", next: 1003 },
                { text: "🗣️ 问旁边的老爷叔附近房租行情", check: "charisma", difficulty: 40, success: 1004, fail: 1005 }
            ]
        },
        1002: {
            id: 1002,
            chapter: "finding",
            text: "你拨通了电话，对面传来一个油腻的声音：\n\n「嗨～亲，我是链家金牌经纪人小王！那套房子就在徐汇老洋房，今天刚空出来，你要不要现在就来看？旁边就是徐家汇书院，文艺得很！」\n\n语速飞快，不给你思考时间。",
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
            text: "你继续刷着手机，眼前闪过各种房源：\n\n「静安寺老破小，押一付三，仅限女生」\n「陆家嘴隔断间，朝北，月租3500」\n「田子坊石库门阁楼，复古风情，2400」...\n\n刷了半小时，你觉得脖子有点酸。",
            scene: "street",
            effects: { energy: -1 },
            options: [
                { text: "💪 继续刷，不信找不到好房", next: 1008 },
                { text: "☕ 先去Manner坐下来慢慢找", next: 1009, effects: { money: -1 } },
                { text: "📱 回头联系刚才那个800的房子", next: 1002 }
            ]
        },
        1004: {
            id: 1004,
            chapter: "finding",
            text: "老爷叔热情地拉着你的手：\n\n「小阿弟，侬不晓得，上海这地方最便宜也要两千多！八百块？要么是群租房要么阁楼间！我跟侬讲，前面弄堂里有个老阿姨自己出租，就住宛平南路那边，价格蛮公道的...」\n\n老爷叔掏出一张皱巴巴的纸条递给你。",
            scene: "street",
            effects: { charisma: 1 },
            gainItem: "granny_note",
            options: [
                { text: "📝 收好纸条，去找老阿姨", next: 1011 },
                { text: "🙏 谢过老爷叔，还是先看看800的房子", next: 1002 },
                { text: "📱 同时记下两个联系方式", next: 1010, effects: { charisma: 1 } }
            ]
        },
        1005: {
            id: 1005,
            chapter: "finding",
            text: "老爷叔警惕地看了你一眼：\n\n「问东问西的！侬是中原地产派来探底价的伐？走走走！」\n\n你被老爷叔的气势吓退，灰溜溜地走了。看来搭话技巧还需要提升啊...",
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
            text: "功夫不负有心人！你发现了一个看起来靠谱的房源：\n\n「普陀老破小·两室户·真实图片·2200/月·押一付三·近地铁11号线」\n\n评论区有人说房东是个和善的徐汇老阿姨。",
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
            text: "你走进淮海路一家Manner咖啡店，要了杯15块的美式。\n\n正当你低头刷手机时，邻桌有人在打电话：\n「...对，那个房子在武康大楼旁边，空了三个月了，房东急着租出去，你去砍砍价肯定能便宜...」\n\n你竖起了耳朵。",
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
            text: "你按照地址找到了老公房小区。\n\n一个穿着格子衬衫、头发梳得油亮的年轻人已经在门口等你了，胸前挂着「我爱我家·金牌经纪人」的工牌。\n\n「来来来，跟我上楼！侬运气老好的，这套房子老抢手的，今天已经有三拨人看过了！」",
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
            text: "你拨通了号码，接电话的是一位嗓音温柔的上海阿姨：\n\n「喂～侬找房子呀？阿拉这边有个朝北小单间，老清爽的哦！两千一个月，侬来看看伐？就在宛平南路600号那边。」\n\n听起来很靠谱！",
            scene: "phone",
            effects: { mood: 1 },
            options: [
                { text: "🏠 马上去宛平南路看房", next: 2010 },
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
            text: "你仔细观察了周边环境：\n\n✅ 距离地铁11号线步行8分钟\n✅ 楼下有联华超市和生煎店\n✅ 弄堂口有爷叔在下象棋\n⚠️ 不过隔壁好像在改造石库门，可能会有噪音\n\n整体来说还可以！",
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
            text: "你成功听到了关键信息！\n\n那个人说的是「愚园路老洋房」，房东姓李，因为要移民加拿大急租，价格好商量。\n\n这可能是个捡漏的好机会！",
            scene: "coffee",
            effects: { charisma: 1 },
            gainItem: "secret_address",
            options: [
                { text: "🏃 立刻去愚园路看看", next: 2010 },
                { text: "📱 先在网上查查这个地段", next: 1008 }
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
            text: "上海阿姨耐心地告诉你：\n\n「阿拉房子是朝南的哟，有个小阳台可以晒衣裳。就是楼层高了点，六楼没电梯。不过年轻人爬爬楼梯锻炼锻炼身体嘛！」\n\n听起来除了没电梯其他都不错。",
            scene: "phone",
            options: [
                { text: "🏠 六楼算什么！去看房", next: 2010 },
                { text: "😓 六楼没电梯...算了吧", next: 1003, effects: { energy: -1 } }
            ]
        },

        // ========== 签约篇 ==========
        2001: {
            id: 2001,
            chapter: "signing",
            text: "推开门的瞬间，你惊呆了：\n\n这哪是什么「静安寺朝南一室户」！分明是用石膏板隔出来的群租房格子间，窗户对着隔壁楼的墙，采光约等于零。\n\n角落里还摆着上个租客留下的旧床垫，散发着一股梅雨季的霉味...",
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
            text: "你来到了宛平南路600号。\n\n开门的是一位笑眯眯的上海阿姨，穿着真丝衬衫，烫着卷发。房间虽然不大但收拾得干干净净，阳台上还养着几盆茉莉花。\n\n「来，进来坐坐！阿拉不收中介费的，直接跟阿拉签就好。」",
            scene: "room_good",
            effects: { mood: 2 },
            options: [
                { text: "😍 太好了！立刻签约！", next: 2011 },
                { text: "💬 阿姨，房租能便宜点伐？", check: "charisma", difficulty: 50, success: 2012, fail: 2013 },
                { text: "🔍 先仔细检查一下房子", check: "handy", difficulty: 40, success: 2014, fail: 2011 }
            ]
        },
        2011: {
            id: 2011,
            chapter: "signing",
            text: "阿姨拿出一份手写的租房协议，条款清清楚楚：\n\n「押一付三，水电煤按账单付，有啥问题随时来敲阿拉门，阿拉就住楼下。」\n\n签好协议，阿姨还塞给你两个生煎包：「肯定饿了吧，趁热吃！」\n\n你终于在这个城市有了个温暖的小窝！",
            scene: "room_good",
            effects: { money: -2, mood: 2 },
            addBuff: { id: "kind_landlord", name: "慈祥上海阿姨", desc: "房东阿姨人很好，心情+1", duration: -1, effect: { mood: 1 } },
            options: [
                { text: "🏠 开始魔都新生活！", next: 3001 }
            ]
        },
        2012: {
            id: 2012,
            chapter: "signing",
            text: "阿姨想了想，用上海话笑着说：\n\n「哎哟，小阿弟/小阿妹嘴巴老甜的嘛！好好好，一千九一个月，再低真的不行了。不过侬要帮阿拉偶尔浇浇花哦～阿拉那几盆茉莉花金贵的！」\n\n成功砍价一百块！",
            scene: "room_good",
            effects: { charisma: 1, money: 1, mood: 1 },
            options: [
                { text: "🤝 成交！签合同", next: 2011 }
            ]
        },
        2013: {
            id: 2013,
            chapter: "signing",
            text: "阿姨摇摇头：\n\n「小阿弟/小阿妹，两千块在宛平南路这边已经很便宜啦！外面都要两千五呢。不过呢，侬要是住满一年，最后一个月阿拉不收钱，算送你的！」\n\n嗯，也不错。",
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
            text: "搬家第一天。你终于把行李从货拉拉上搬进了六楼。\n\n正准备休息，突然听到门外有人敲门。\n\n打开门，一个戴眼镜的男生笑着说：\n「哟，新邻居啊！我是隔壁IT公司的小张，310室的。刚搬来啊？晚上要不要一起去楼下吃小杨生煎？」",
            scene: "hallway",
            options: [
                { text: "😊 好啊！正好饿死了", next: 3002, effects: { mood: 1 } },
                { text: "😅 谢谢，但我想先整理一下", next: 3003 },
                { text: "🗣️ 聊聊这栋楼有什么要注意的", check: "charisma", difficulty: 30, success: 3004, fail: 3002 }
            ]
        },
        3002: {
            id: 3002,
            chapter: "living",
            text: "你和小张去楼下的小杨生煎吃了一顿。\n\n他告诉你，这栋楼的Wi-Fi密码是「88888888」，上海垃圾分类很严，干湿要分开，还有——\n\n「三楼那个老爷叔有点怪，总是半夜在走廊走来走去，说是以前纺织厂上夜班的，你别害怕就好。」",
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
            text: "小张热情地跟你分享了各种上海生存情报：\n\n🔑 快递放在楼下罗森代收\n🔑 热水器别开太大，老公房会跳闸\n🔑 WiFi密码：88888888\n🔑 物业电话贴在楼梯口\n🔑 三楼老爷叔人其实不错，就是觉少...\n🔑 周末早上有弄堂早市，菜比超市便宜\n\n这些信息太有用了！",
            scene: "hallway",
            effects: { charisma: 1, mood: 1 },
            gainItem: "neighbor_info",
            options: [
                { text: "🍜 一起去吃生煎吧", next: 3002 },
                { text: "👋 谢过小张，回去整理房间", next: 3003 }
            ]
        },
        3005: {
            id: 3005,
            chapter: "living",
            text: "小张压低声音说：\n\n「听说那个老爷叔以前是国棉厂的夜班工人，退休后睡不着觉...\n\n之前有个租客说听到他半夜在走廊里唱沪剧，第二天就搬走了。」\n\n你感觉背后发凉...",
            scene: "restaurant",
            effects: { mood: -1 },
            addBuff: { id: "night_worry", name: "深夜恐惧", desc: "对三楼老爷叔的恐惧", duration: 3, effect: { mood: -1 } },
            options: [
                { text: "😱 以后晚上一定要锁好门", next: 3006 },
                { text: "🤔 改天去跟老爷叔聊聊", next: 3006, effects: { mood: 1 } }
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
            text: "小张拿着自己的工具盒过来了：\n\n「我在张江做IT的，这种水管小问题见多了！让我来！」\n\n三下五除二就把水管修好了。你感激涕零。",
            scene: "room",
            effects: { mood: 2 },
            addBuff: { id: "good_neighbor", name: "好邻居", desc: "和小张成为朋友", duration: -1, effect: { mood: 1 } },
            options: [
                { text: "🙏 谢谢小张！改天请你吃生煎", next: 3006 }
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
            text: "你来到了浦东塘桥的二手家具市场，真是个宝藏地方！\n\n到处都是搬家甩卖的家具和电器，还有从拆迁的老洋房收来的 vintage 物件。你在一堆旧货中翻翻找找...",
            scene: "market",
            options: [
                { text: "💡 买个二手台灯（花费1财力）", next: 3021, effects: { money: -1 }, gainItem: "desk_lamp" },
                { text: "🪑 买把还不错的椅子（花费2财力）", next: 3021, effects: { money: -2, mood: 1 } },
                { text: "🗣️ 用上海话跟老板砍个价", check: "charisma", difficulty: 45, success: 3022, fail: 3023 },
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
            text: "你惊叫着冲出房间，差点撞到路过的小张。\n\n「怎么了怎么了？」\n「蟑...蟑螂！！！」\n\n小张淡定地拿了张纸巾走进去，三秒钟后出来：「小意思，搞定了。」\n\n你的英雄小张又一次拯救了你。",
            scene: "hallway",
            effects: { mood: 1 },
            options: [
                { text: "🙏 小张真是我的救星", next: 3015 }
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
            bossName: "终极房东阿姨",
            text: "【最终BOSS：终极房东阿姨！】\n\n租约到期了。房东阿姨来做退房检查。\n\n她推开门，戴着老花镜，烫着一头整齐的卷发，手里拿着一个小本本，眼神犀利如鹰。\n\n「来，阿拉一项一项检查！先看——墙面！弄堂里的房子墙面最要紧，不许有污迹！」\n\n【退房检查战 - 第1项：墙面】\n怒气值：⬜⬜⬜⬜⬜",
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
            text: "房东阿姨推了推老花镜，满意地点点头：\n\n「嗯...还可以，这面墙保养得不错。阿拉以前租给过一个小年轻，墙面画得乱七八糟，扣了他一个月押金！」\n\n✅ 墙面检查通过！",
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
            text: "房东阿姨的眼睛瞪大了，上海话都出来了：\n\n「哎哟喂！这是什么情况！墙上怎么有划痕！侬晓得伐，阿拉这房子是老洋房，补一面墙要多少钱？！」\n\n她在小本本上重重地记了一笔。\n\n❌ 墙面检查失败！怒气+1",
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
            text: "你提前准备了一桶和原来一模一样的墙漆，把所有痕迹都盖住了！\n\n房东阿姨仔细看了半天，满意地拍拍手：「嗯，这面墙跟新的一样嘛！小阿弟/小阿妹老细致的嘛！不错不错。」\n\n✅ 完美通过！",
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
            text: "房东阿姨走到桌子前，用手指划过桌面：\n\n「家具呢？让阿拉看看这些桌椅有没有坏掉。这可是阿拉当年陪嫁的老家具，金贵得很！」\n\n她弯腰检查桌腿、椅子和衣柜...\n\n【退房检查 - 第2项：家具】",
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
            text: "你之前就用万能扳手把所有松动的螺丝都拧紧了，桌椅稳固如新！\n\n房东阿姨试着摇了摇桌子，眼睛一亮：「哎哟，比我当初嫁过来的时候还结实！小阿弟/小阿妹动手能力老强的嘛！」\n\n✅ 家具检查完美通过！",
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
            text: "房东阿姨最后走进卫生间和厨房：\n\n「最后看看清爽伐...阿拉上海人最讲究卫生，弄堂房子里ockroach一只都不许有！」\n\n她打开灶台、检查排水口、看了看马桶...\n\n【退房检查 - 第3项：卫生】",
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
            text: "你之前花钱买了专业清洁套装，把房子里里外外打扫得一尘不染！\n\n房东阿姨简直不敢相信，连连点头：「哎哟喂，这...比阿拉自己打扫得还清爽！小阿弟/小阿妹老有素质的嘛！」\n\n✅ 卫生检查完美通过！",
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
            text: "房东阿姨合上小本本，推了推老花镜，上上下下打量着你...",
            scene: "room_check",
            isBossResult: true,
            options: []
        },
        9301: {
            id: 9301,
            chapter: "boss_landlord",
            text: "🎉🎉🎉 【最终BOSS战胜利！】\n\n房东阿姨露出了满意的笑容，用上海话夸奖你：\n\n「老灵额！侬是阿拉见过最靠谱的租客！押金一分不少全退给侬！」\n\n她从布包里掏出一个红包：「这是阿拉的一点心意，下次有宛平南路的好房子第一个通知侬！有空来家里吃本帮菜！」\n\n🏆 恭喜你成功保住了全部押金！\n上海租房大冒险——通关！",
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
            text: "😤 【最终BOSS战失败...】\n\n房东阿姨气得卷发都在抖，上海话都出来了：\n\n「看看侬把房子糟蹋成什么样子！押金一分都不退！还要额外赔偿！侬这种人阿拉以后再也不租了！」\n\n你含泪掏出了最后的积蓄...\n\n不过，这次的经验教训一定会让你下次在上海租房做得更好！\n\n上海租房大冒险——结束。",
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
        granny_note: { name: "老爷叔的纸条", desc: "上面写着宛平南路老阿姨的电话", icon: "📝" },
        secret_address: { name: "神秘地址", desc: "Manner咖啡偷听到的愚园路房源", icon: "🏠" },
        earplugs: { name: "隔音耳塞", desc: "老洋房隔音差，这个必备", icon: "🔇" },
        wrench: { name: "万能扳手", desc: "动手能力+加成，可用于BOSS战", icon: "🔧" },
        toolkit: { name: "维修工具箱", desc: "前租客留下的工具，动手+2", icon: "🧰" },
        wall_secret: { name: "群租房秘密", desc: "你发现了隔断墙的秘密", icon: "🧱" },
        neighbor_info: { name: "魔都生存指南", desc: "小张分享的上海租房情报", icon: "📋" },
        contract_knowledge: { name: "合同避坑指南", desc: "了解了上海租房合同里的坑", icon: "📜" },
        contract_photo: { name: "合同照片", desc: "拍下了霸王条款作为维权证据", icon: "📸" },
        agent_evidence: { name: "中介黑料", desc: "记录了链家小王的不当行为", icon: "📝" },
        fuzzy_contract: { name: "模糊合同", desc: "可在中介BOSS战中使用", icon: "📄" },
        agent_recording: { name: "录音证据", desc: "中介威胁不退押金的录音", icon: "🎙️" },
        negotiation_exp: { name: "魔都砍价术", desc: "在上海租房市场磨练出的谈判技巧", icon: "🏅" },
        super_glue: { name: "502万能胶", desc: "修补东西的好帮手", icon: "🧴" },
        desk_lamp: { name: "塘桥二手台灯", desc: "浦东二手市场淘的，虽然旧但还亮", icon: "💡" },
        wall_paint: { name: "立邦墙漆", desc: "和宛平南路老洋房一模一样的墙漆", icon: "🎨" },
        cleaning_kit: { name: "专业清洁套装", desc: "阿姨推荐的上海老牌清洁用品", icon: "✨" },
        bug_spray: { name: "雷达杀虫喷雾", desc: "对上海大蟑螂特攻", icon: "🧴" }
    },

    // Boss战中间轮次的事件ID列表
    bossAgentRounds: [9050, 9051, 9052],
    bossLandlordChecks: [9240, 9260],

    // 触发BOSS战的条件：完成一定数量的居住篇事件后
    bossAgentTriggerCount: 6,
    bossLandlordTriggerCount: 12,

    // 角色立绘配置
    characters: {
        old_man: { name: "弄堂老爷叔", image: "asset/pawn/和善老头.jpeg" },
        landlord_lady: { name: "上海阿姨", image: "asset/pawn/房东大妈.jpeg" },
        agent: { name: "链家小王", image: "asset/pawn/中介小哥.jpeg" },
        roommate: { name: "张江小张", image: "asset/pawn/热情室友.jpeg" },
        otaku: { name: "隔壁阿宅", image: "asset/pawn/死宅室友.jpeg" },
        strict_landlord: { name: "挑剔房东", image: "asset/pawn/严厉房东.jpeg" },
        staff: { name: "物业师傅", image: "asset/pawn/公寓员工.jpeg" },
        coffee_guy: { name: "咖啡店白领", image: "asset/pawn/coffee_guy.jpeg" },
        night_uncle: { name: "三楼老爷叔", image: "asset/pawn/night_uncle.jpeg" },
        market_boss: { name: "二手市场老板", image: "asset/pawn/market_boss.jpeg" },
    },

    // 事件对应的角色立绘映射
    eventCharacters: {
        // 弄堂老爷叔
        1004: "old_man",
        1005: "old_man",
        // 链家小王
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
        // 上海阿姨
        1011: "landlord_lady",
        1020: "landlord_lady",
        2010: "landlord_lady",
        2011: "landlord_lady",
        2012: "landlord_lady",
        2013: "landlord_lady",
        2014: "landlord_lady",
        // 张江小张
        3001: "roommate",
        3002: "roommate",
        3004: "roommate",
        3005: "roommate",
        3010: "roommate",
        3026: "roommate",
        // 物业师傅
        3009: "staff",
        // 咖啡店白领
        1009: "coffee_guy",
        1016: "coffee_guy",
        1017: "coffee_guy",
        // 三楼夜班老爷叔
        3005: "night_uncle",
        3006: "night_uncle",
        3011: "night_uncle",
        3012: "night_uncle",
        // 二手市场老板
        3016: "market_boss",
        3022: "market_boss",
        3023: "market_boss",
        // Boss战 - 链家小王
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
        // Boss战 - 挑剔房东阿姨
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
