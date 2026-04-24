import type { OfficialIndexFile } from './types';
import content0 from "../../public/assets/data/events/[event]盟约日.txt?raw";
import content1 from "../../public/assets/data/events/[event]长夜守望节.txt?raw";
import content2 from "../../public/assets/data/events/[event]亡诞日.txt?raw";
import content3 from "../../public/assets/data/events/[event]倾国倾城祭.txt?raw";
import content4 from "../../public/assets/data/events/[event]耀日回归祭.txt?raw";
import content5 from "../../public/assets/data/events/[event]祈福日.txt?raw";
import content6 from "../../public/assets/data/events/[event]初光礼.txt?raw";
import content7 from "../../public/assets/data/events/[event]开拓日.txt?raw";
import content8 from "../../public/assets/data/events/[event]归港节.txt?raw";
import content9 from "../../public/assets/data/events/[event]圣翼阅礼.txt?raw";
import content10 from "../../public/assets/data/events/[event]荣耀之冠节.txt?raw";
import content11 from "../../public/assets/data/events/[event]万卷灯会.txt?raw";
import content12 from "../../public/assets/data/events/[event]幻沫假面祭.txt?raw";
import content13 from "../../public/assets/data/events/[event]双狮鹫节.txt?raw";
import content14 from "../../public/assets/data/events/[event]深蓝拍卖会.txt?raw";
import content15 from "../../public/assets/data/events/[event]大考月.txt?raw";
import content16 from "../../public/assets/data/events/[event]踏星仪式.txt?raw";
import content17 from "../../public/assets/data/events/[event]赛瑞利亚摸鱼大赛.txt?raw";
import content18 from "../../public/assets/data/events/[event]焰穹祭.txt?raw";
import content19 from "../../public/assets/data/events/[event]圣羽加冕.txt?raw";
import content20 from "../../public/assets/data/events/[event]金铎升华日.txt?raw";
import content21 from "../../public/assets/data/events/[event]流沙祈福节.txt?raw";
import content22 from "../../public/assets/data/events/[event]风铃欢歌节.txt?raw";
import content23 from "../../public/assets/data/events/[event]金浪丰收祭.txt?raw";
import content24 from "../../public/assets/data/events/[event]英雄追思日.txt?raw";
import content25 from "../../public/assets/data/events/[event]金穗节.txt?raw";
import content26 from "../../public/assets/data/events/[event]迎冬节.txt?raw";
import content27 from "../../public/assets/data/events/[event]先祖大狩猎.txt?raw";
import content28 from "../../public/assets/data/events/[event]兽灵之夜.txt?raw";
import content29 from "../../public/assets/data/events/[event]辉煌祈光.txt?raw";
import content30 from "../../public/assets/data/events/[event]赛瑞利亚演奏会.txt?raw";
import content31 from "../../public/assets/data/events/[event]星轨祭.txt?raw";
import content32 from "../../public/assets/data/events/[event]星环博览会.txt?raw";
import content33 from "../../public/assets/data/events/[event]赛瑞利亚灯海夜.txt?raw";
import content34 from "../../public/assets/data/books/[BOOK]旅游宣发读物_盟约日观礼手册.txt?raw";
import content35 from "../../public/assets/data/books/[BOOK]旅游宣发读物_长夜守望节守夜手册.txt?raw";
import content36 from "../../public/assets/data/books/[BOOK]旅游宣发读物_亡诞日纪念手册.txt?raw";
import content37 from "../../public/assets/data/books/[BOOK]旅游宣发读物_阿芙罗黛蒂之冠.txt?raw";
import content38 from "../../public/assets/data/books/[BOOK]旅游宣发读物_耀日回归祭观礼指南.txt?raw";
import content39 from "../../public/assets/data/books/[BOOK]旅游宣发读物_祈福日乡野巡礼.txt?raw";
import content40 from "../../public/assets/data/books/[BOOK]旅游宣发读物_初光礼仪典导览.txt?raw";
import content41 from "../../public/assets/data/books/[BOOK]旅游宣发读物_开拓日位面纪行.txt?raw";
import content42 from "../../public/assets/data/books/[BOOK]旅游宣发读物_归港节港口手册.txt?raw";
import content43 from "../../public/assets/data/books/[BOOK]旅游宣发读物_圣翼阅礼观礼册.txt?raw";
import content44 from "../../public/assets/data/books/[BOOK]旅游宣发读物_荣耀之冠节角斗指南.txt?raw";
import content45 from "../../public/assets/data/books/[BOOK]旅游宣发读物_万卷灯会白曜城导览.txt?raw";
import content46 from "../../public/assets/data/books/[BOOK]旅游宣发读物_幻沫与潮汐之恋.txt?raw";
import content47 from "../../public/assets/data/books/[BOOK]旅游宣发读物_双狮鹫节帝都观礼手册.txt?raw";
import content48 from "../../public/assets/data/books/[BOOK]旅游宣发读物_深蓝拍卖会游客手册.txt?raw";
import content49 from "../../public/assets/data/books/[BOOK]旅游宣发读物_大考月备考与观礼指南.txt?raw";
import content50 from "../../public/assets/data/books/[BOOK]旅游宣发读物_踏星仪式报考指南.txt?raw";
import content51 from "../../public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚摸鱼大赛观光指南.txt?raw";
import content52 from "../../public/assets/data/books/[BOOK]旅游宣发读物_焰穹祭火山庆典手册.txt?raw";
import content53 from "../../public/assets/data/books/[BOOK]旅游宣发读物_圣羽加冕仪典指引.txt?raw";
import content54 from "../../public/assets/data/books/[BOOK]旅游宣发读物_金铎升华日庆典手册.txt?raw";
import content55 from "../../public/assets/data/books/[BOOK]旅游宣发读物_流沙祈福节旅路手册.txt?raw";
import content56 from "../../public/assets/data/books/[BOOK]旅游宣发读物_风铃欢歌节巡礼册.txt?raw";
import content57 from "../../public/assets/data/books/[BOOK]旅游宣发读物_金浪丰收祭长桌指南.txt?raw";
import content58 from "../../public/assets/data/books/[BOOK]旅游宣发读物_英雄追思日纪念读本.txt?raw";
import content59 from "../../public/assets/data/books/[BOOK]旅游宣发读物_金穗节秋收手记.txt?raw";
import content60 from "../../public/assets/data/books/[BOOK]旅游宣发读物_迎冬节篝火手册.txt?raw";
import content61 from "../../public/assets/data/books/[BOOK]旅游宣发读物_先祖大狩猎观赛指南.txt?raw";
import content62 from "../../public/assets/data/books/[BOOK]旅游宣发读物_兽灵之夜林歌城巡礼.txt?raw";
import content63 from "../../public/assets/data/books/[BOOK]旅游宣发读物_辉煌祈光晨礼导览.txt?raw";
import content64 from "../../public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚海岸演奏会导览.txt?raw";
import content65 from "../../public/assets/data/books/[BOOK]旅游宣发读物_星轨祭极光导览.txt?raw";
import content66 from "../../public/assets/data/books/[BOOK]旅游宣发读物_星环博览会商旅手册.txt?raw";
import content67 from "../../public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚灯海夜祈愿手册.txt?raw";
import content68 from "../../public/assets/data/reminders/诺斯加德联盟提醒.txt?raw";
import content69 from "../../public/assets/data/reminders/索伦蒂斯王国提醒.txt?raw";
import content70 from "../../public/assets/data/reminders/奥古斯提姆帝国提醒.txt?raw";
import content71 from "../../public/assets/data/reminders/亡灵帝国提醒.txt?raw";
import content72 from "../../public/assets/data/reminders/翼民圣都梵尼亚提醒.txt?raw";
import content73 from "../../public/assets/data/reminders/萨赫拉联邦提醒.txt?raw";
import content74 from "../../public/assets/data/reminders/伯伦斯法环提醒.txt?raw";
import content75 from "../../public/assets/data/reminders/赛瑞利亚提醒.txt?raw";

const officialIndexData = {
  "version": 1,
  "description": "官方节庆与读物索引。这里存结构化元数据；正文内容放在独立文件中，避免把长文本塞进 TypeScript。",
  "reminder_groups": [
    {
      "id": "norsgard",
      "title": "诺斯加德联盟提醒",
      "content_file": "public/assets/data/reminders/诺斯加德联盟提醒.txt"
    },
    {
      "id": "solentis",
      "title": "索伦蒂斯王国提醒",
      "content_file": "public/assets/data/reminders/索伦蒂斯王国提醒.txt"
    },
    {
      "id": "augestim",
      "title": "奥古斯提姆帝国提醒",
      "content_file": "public/assets/data/reminders/奥古斯提姆帝国提醒.txt"
    },
    {
      "id": "undeath_empire",
      "title": "亡灵帝国提醒",
      "content_file": "public/assets/data/reminders/亡灵帝国提醒.txt"
    },
    {
      "id": "vania",
      "title": "翼民圣都梵尼亚提醒",
      "content_file": "public/assets/data/reminders/翼民圣都梵尼亚提醒.txt"
    },
    {
      "id": "sahra",
      "title": "萨赫拉联邦提醒",
      "content_file": "public/assets/data/reminders/萨赫拉联邦提醒.txt"
    },
    {
      "id": "borens",
      "title": "伯伦斯法环提醒",
      "content_file": "public/assets/data/reminders/伯伦斯法环提醒.txt"
    },
    {
      "id": "sairelia",
      "title": "赛瑞利亚提醒",
      "content_file": "public/assets/data/reminders/赛瑞利亚提醒.txt"
    }
  ],
  "month_aliases": [
    {
      "month": 1,
      "label": "苏醒",
      "season": "初春"
    },
    {
      "month": 2,
      "label": "新芽",
      "season": "初春"
    },
    {
      "month": 3,
      "label": "风信",
      "season": "初春"
    },
    {
      "month": 4,
      "label": "辉光",
      "season": "盛夏"
    },
    {
      "month": 5,
      "label": "繁盛",
      "season": "盛夏"
    },
    {
      "month": 6,
      "label": "旅人",
      "season": "盛夏"
    },
    {
      "month": 7,
      "label": "丰收",
      "season": "金秋"
    },
    {
      "month": 8,
      "label": "赤叶",
      "season": "金秋"
    },
    {
      "month": 9,
      "label": "静谧",
      "season": "金秋"
    },
    {
      "month": 10,
      "label": "霜降",
      "season": "寒冬"
    },
    {
      "month": 11,
      "label": "长夜",
      "season": "寒冬"
    },
    {
      "month": 12,
      "label": "星见",
      "season": "寒冬"
    }
  ],
  "festivals": [
    {
      "id": "alliance_day",
      "title": "盟约日",
      "summary": "纪念诺斯加德联盟建立的全境节庆，议会、军团与民众会在凛冬深处重申盟约与共同守土的誓言。",
      "start": "01-08",
      "end": "01-08",
      "content_file": "public/assets/data/events/[event]盟约日.txt",
      "related_books": [
        "alliance_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "白曜城"
        ],
        "mention_keywords": [
          "盟约日",
          "霜狼盟约",
          "联盟建立"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "alliance_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "longnight_watch_festival",
      "title": "长夜守望节",
      "summary": "极夜最漫长的一天里，维斯格拉德公国会纪念初代守夜人，并在永夜长垣点燃绵延数百里的烽火。",
      "start": "01-14",
      "end": "01-14",
      "content_file": "public/assets/data/events/[event]长夜守望节.txt",
      "related_books": [
        "longnight_watch_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "维斯格拉德公国",
          "永夜长垣"
        ],
        "mention_keywords": [
          "长夜守望节",
          "初代守夜人",
          "烽火长垣"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "longnight_watch_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "undeath_day",
      "title": "亡诞日",
      "summary": "亡灵帝国纪念全国转化为亡灵的国难之日，以亡者的“新生”回望那场鱼死网破的胜利。",
      "start": "01-22",
      "end": "01-22",
      "content_file": "public/assets/data/events/[event]亡诞日.txt",
      "related_books": [
        "undeath_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "亡灵帝国",
          "伯恩·瑞瑟喃斯"
        ],
        "mention_keywords": [
          "亡诞日",
          "全国转化为亡灵",
          "亡灵帝国"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "undeath_empire",
        "section_id": "undeath_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "goddess_beauty_contest",
      "title": "倾国倾城祭",
      "summary": "面向全大陆的世界级盛会，以海选、筹备巡游与终焉决赛层层筛出本年度“阿芙罗黛蒂”。",
      "start": "02-01",
      "end": "02-14",
      "content_file": "public/assets/data/events/[event]倾国倾城祭.txt",
      "related_books": [
        "aphrodite_crown"
      ],
      "controller": {
        "location_keywords": [
          "索伦蒂斯王国",
          "银帆城"
        ],
        "mention_keywords": [
          "倾国倾城祭",
          "阿芙罗黛蒂",
          "选美大赛"
        ],
        "reminder_days": 7
      },
      "stages": [
        {
          "id": "beauty_preliminary",
          "day_index": 1,
          "title": "初绽",
          "summary": "02-01 至 02-04 的海选期，参赛者在街头公开展演并争取初始选票。",
          "start": "02-01",
          "end": "02-04"
        },
        {
          "id": "beauty_preparation_and_parade",
          "day_index": 2,
          "title": "筹备与巡游",
          "summary": "02-05 至 02-12 的号召力测试，包含筹资建队与 02-12 的花车/魔宠巡游。",
          "start": "02-05",
          "end": "02-12"
        },
        {
          "id": "beauty_finale",
          "day_index": 3,
          "title": "怒放",
          "summary": "02-14 的终焉决赛，在苍籁剧场进行最终加冕。",
          "start": "02-14",
          "end": "02-14"
        }
      ],
      "reminder": {
        "enabled": true,
        "group": "solentis",
        "section_id": "goddess_beauty_contest",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "sunreturn_festival",
      "title": "耀日回归祭",
      "summary": "极夜结束后的第一缕阳光被视为光明回归的信号，各地会点燃初王火炬与烽火共同庆祝。",
      "start": "02-15",
      "end": "02-15",
      "content_file": "public/assets/data/events/[event]耀日回归祭.txt",
      "related_books": [
        "sunreturn_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟"
        ],
        "mention_keywords": [
          "耀日回归祭",
          "初王火炬",
          "光明回归"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "sunreturn_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "spring_prayer_day",
      "title": "祈福日",
      "summary": "春耕前夕的帝国祈愿日，民众会向圣灵祈求风调雨顺、土地纯净与新一年的安稳丰收。",
      "start": "02-18",
      "end": "02-18",
      "content_file": "public/assets/data/events/[event]祈福日.txt",
      "related_books": [
        "spring_prayer_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "奥古斯提姆帝国",
          "艾瑟嘉德"
        ],
        "mention_keywords": [
          "祈福日",
          "春耕前夕",
          "圣灵祈愿"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "augestim",
        "section_id": "spring_prayer_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "firstlight_rite",
      "title": "初光礼",
      "summary": "翼民圣都在满月之夜为新生翼民授予初始圣纹的庄严圣礼，誓言与荣光会在圣光中一同被见证。",
      "start": "02-24",
      "end": "02-24",
      "content_file": "public/assets/data/events/[event]初光礼.txt",
      "related_books": [
        "firstlight_rite_guide"
      ],
      "controller": {
        "location_keywords": [
          "翼民圣都梵尼亚",
          "圣都梵尼亚"
        ],
        "mention_keywords": [
          "初光礼",
          "初始圣纹",
          "新生翼民"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "vania",
        "section_id": "firstlight_rite",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "frontier_expansion_day",
      "title": "开拓日",
      "summary": "亡灵帝国纪念六个位面开拓成果的节日，象征其对未知疆域与新位面的永恒探索意志。",
      "start": "03-12",
      "end": "03-12",
      "content_file": "public/assets/data/events/[event]开拓日.txt",
      "related_books": [
        "frontier_expansion_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "亡灵帝国"
        ],
        "mention_keywords": [
          "开拓日",
          "位面开拓",
          "六个位面"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "undeath_empire",
        "section_id": "frontier_expansion_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "homecoming_harbor_festival",
      "title": "归港节",
      "summary": "海冰融化后的首航庆典，北境沿海港口会彻夜点亮防雾灯，并向海中抛洒金币祈求航运昌隆。",
      "start": "03-19",
      "end": "03-19",
      "content_file": "public/assets/data/events/[event]归港节.txt",
      "related_books": [
        "homecoming_harbor_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "凛风渡",
          "霜镜港",
          "白港"
        ],
        "mention_keywords": [
          "归港节",
          "首航",
          "防雾灯"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "homecoming_harbor_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "holy_wing_review",
      "title": "圣翼阅礼",
      "summary": "圣翼骑士团向圣都与教皇展示守护与荣光的空域阅兵庆典，编队飞行与圣辉仪仗构成核心看点。",
      "start": "04-18",
      "end": "04-18",
      "content_file": "public/assets/data/events/[event]圣翼阅礼.txt",
      "related_books": [
        "holy_wing_review_guide"
      ],
      "controller": {
        "location_keywords": [
          "翼民圣都梵尼亚",
          "圣都梵尼亚"
        ],
        "mention_keywords": [
          "圣翼阅礼",
          "圣翼骑士团",
          "空域阅兵"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "vania",
        "section_id": "holy_wing_review",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "crown_of_glory_festival",
      "title": "荣耀之冠节",
      "summary": "萨赫拉联邦阿兹哈尔举行的年度角斗冠军大赛，冠军将以力量与鲜血夺得至高荣誉。",
      "start": "04-26",
      "end": "04-26",
      "content_file": "public/assets/data/events/[event]荣耀之冠节.txt",
      "related_books": [
        "crown_of_glory_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "萨赫拉联邦",
          "阿兹哈尔"
        ],
        "mention_keywords": [
          "荣耀之冠节",
          "年度角斗冠军赛",
          "阿兹哈尔"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "sahra",
        "section_id": "crown_of_glory_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "tome_lantern_fair",
      "title": "万卷灯会",
      "summary": "凛冬大学建院纪念日的三日开放庆典，研究成果、魔导新品与五色灯笼共同将白曜城点亮成学术与市集的盛会。",
      "start": "05-06",
      "end": "05-08",
      "content_file": "public/assets/data/events/[event]万卷灯会.txt",
      "related_books": [
        "tome_lantern_fair_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "白曜城",
          "凛冬大学"
        ],
        "mention_keywords": [
          "万卷灯会",
          "凛冬大学",
          "五色灯笼"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "tome_lantern_fair",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "huanmo_mask_festival",
      "title": "幻沫假面祭",
      "summary": "全民阶级消除与欲望释放的七日狂欢节。",
      "start": "05-14",
      "end": "05-20",
      "content_file": "public/assets/data/events/[event]幻沫假面祭.txt",
      "related_books": [
        "huanmo_origin_story"
      ],
      "controller": {
        "location_keywords": [
          "索伦蒂斯王国"
        ],
        "mention_keywords": [
          "幻沫假面祭"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "solentis",
        "section_id": "huanmo_mask_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "twin_griffin_festival",
      "title": "双狮鹫节",
      "summary": "奥古斯提姆帝国的建立纪念日，首都将举行大阅兵、骑士比武与双头狮鹫伴飞的王权仪典。",
      "start": "05-27",
      "end": "05-27",
      "content_file": "public/assets/data/events/[event]双狮鹫节.txt",
      "related_books": [
        "twin_griffin_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "奥古斯提姆帝国",
          "艾瑟嘉德"
        ],
        "mention_keywords": [
          "双狮鹫节",
          "帝国建立纪念日",
          "双头狮鹫"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "augestim",
        "section_id": "twin_griffin_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "deepblue_auction_summer",
      "title": "深蓝拍卖会",
      "summary": "大陆最高规格黑市拍卖，汇聚违禁品、稀有收藏与权贵暗盘交易。",
      "start": "06-06",
      "end": "06-06",
      "content_file": "public/assets/data/events/[event]深蓝拍卖会.txt",
      "related_books": [
        "deepblue_auction_guide"
      ],
      "controller": {
        "location_keywords": [
          "索伦蒂斯王国",
          "潮汐王座"
        ],
        "mention_keywords": [
          "深蓝拍卖会",
          "黑市拍卖"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "solentis",
        "section_id": "deepblue_auction_summer",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "imperial_exam_month",
      "title": "大考月",
      "summary": "帝国一年一度的官员选拔月度活动，围绕政治与管理能力展开多轮严苛考核，开考日即意味着整月竞争开始。",
      "start": "06-15",
      "end": "06-15",
      "content_file": "public/assets/data/events/[event]大考月.txt",
      "related_books": [
        "imperial_exam_month_guide"
      ],
      "controller": {
        "location_keywords": [
          "奥古斯提姆帝国",
          "艾瑟嘉德"
        ],
        "mention_keywords": [
          "大考月",
          "官员选拔",
          "帝国考试"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "augestim",
        "section_id": "imperial_exam_month",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "stepping_star_rite",
      "title": "踏星仪式",
      "summary": "雾晶学院三年一度的招生选拔仪式，通过者将得到就读机会并正式踏入雾晶港的精英学术体系。",
      "start": "06-24",
      "end": "06-24",
      "content_file": "public/assets/data/events/[event]踏星仪式.txt",
      "related_books": [
        "stepping_star_rite_guide"
      ],
      "controller": {
        "location_keywords": [
          "伯伦斯法环",
          "雾晶港",
          "雾晶学院"
        ],
        "mention_keywords": [
          "踏星仪式",
          "雾晶学院",
          "招生选拔"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "borens",
        "section_id": "stepping_star_rite",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "sairelia_fishing_contest",
      "title": "摸鱼大赛",
      "summary": "赛瑞利亚每年夏季举办的趣味赛事，参与者要在热闹海滨“真正摸鱼”，比拼谁能摸到最多飞天鱼。",
      "start": "07-07",
      "end": "07-07",
      "content_file": "public/assets/data/events/[event]赛瑞利亚摸鱼大赛.txt",
      "related_books": [
        "sairelia_fishing_contest_guide"
      ],
      "controller": {
        "location_keywords": [
          "赛瑞利亚"
        ],
        "mention_keywords": [
          "摸鱼大赛",
          "飞天鱼",
          "真正的摸鱼"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "sairelia",
        "section_id": "sairelia_fishing_contest",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "flame_dome_festival",
      "title": "焰穹祭",
      "summary": "天陨之冠火山活动最活跃时举行的斯卡尔盛典，龙骑士巡空、龙火祭台与锻造大赛一同点燃风切半岛的夏夜。",
      "start": "07-12",
      "end": "07-12",
      "content_file": "public/assets/data/events/[event]焰穹祭.txt",
      "related_books": [
        "flame_dome_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "斯卡尔公国",
          "龙吼堡垒"
        ],
        "mention_keywords": [
          "焰穹祭",
          "龙骑士",
          "龙火祭台"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "flame_dome_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "holy_feather_coronation",
      "title": "圣羽加冕",
      "summary": "梵尼亚授予卓越翼民羽冠与名号的荣耀庆典，象征羽翼纯洁与圣纹修行已经臻于成熟。",
      "start": "07-20",
      "end": "07-20",
      "content_file": "public/assets/data/events/[event]圣羽加冕.txt",
      "related_books": [
        "holy_feather_coronation_guide"
      ],
      "controller": {
        "location_keywords": [
          "翼民圣都梵尼亚"
        ],
        "mention_keywords": [
          "圣羽加冕",
          "羽冠",
          "卓越翼民"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "vania",
        "section_id": "holy_feather_coronation",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "jinduo_ascension_day",
      "title": "金铎升华日",
      "summary": "萨赫拉联邦向烈日与财富之主献上黄金的宗教庆典，以祈求商业繁荣、财富流转与来年的强盛运势。",
      "start": "07-28",
      "end": "07-28",
      "content_file": "public/assets/data/events/[event]金铎升华日.txt",
      "related_books": [
        "jinduo_ascension_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "萨赫拉联邦"
        ],
        "mention_keywords": [
          "金铎升华日",
          "金铎显现纪念日",
          "烈日与财富之主"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "sahra",
        "section_id": "jinduo_ascension_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "shifting_sand_blessing_festival",
      "title": "流沙祈福节",
      "summary": "沙暴季到来前的平安祈愿仪式，绿洲城邦与沙海商旅都会在此时为道路、水源与归途求得祝福。",
      "start": "08-08",
      "end": "08-08",
      "content_file": "public/assets/data/events/[event]流沙祈福节.txt",
      "related_books": [
        "shifting_sand_blessing_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "萨赫拉联邦"
        ],
        "mention_keywords": [
          "流沙祈福节",
          "沙暴季",
          "平安祈愿"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "sahra",
        "section_id": "shifting_sand_blessing_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "windbell_song_festival",
      "title": "风铃欢歌节",
      "summary": "梵尼亚在白石回廊与外环挂满风铃和彩带，以合唱、赠礼与祈愿祝福众翼安好的欢乐节日。",
      "start": "08-22",
      "end": "08-22",
      "content_file": "public/assets/data/events/[event]风铃欢歌节.txt",
      "related_books": [
        "windbell_song_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "翼民圣都梵尼亚",
          "圣都梵尼亚"
        ],
        "mention_keywords": [
          "风铃欢歌节",
          "风铃",
          "彩带"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "vania",
        "section_id": "windbell_song_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "golden_wave_harvest_festival",
      "title": "金浪丰收祭",
      "summary": "诺德海姆公国秋收后的七日狂欢，大公会开启第一桶新酿麦酒，各地长桌宴与流水席持续迎接四方来客。",
      "start": "09-08",
      "end": "09-14",
      "content_file": "public/assets/data/events/[event]金浪丰收祭.txt",
      "related_books": [
        "golden_wave_harvest_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "诺德海姆公国",
          "琥珀加德"
        ],
        "mention_keywords": [
          "金浪丰收祭",
          "新酿麦酒",
          "露天长桌"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "golden_wave_harvest_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "heroes_remembrance_day",
      "title": "英雄追思日",
      "summary": "帝国悼念位面入侵终结之役牺牲者的纪念日，人们会向英灵殿献上白色鸢尾花并举行追思弥撒。",
      "start": "09-18",
      "end": "09-18",
      "content_file": "public/assets/data/events/[event]英雄追思日.txt",
      "related_books": [
        "heroes_remembrance_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "奥古斯提姆帝国"
        ],
        "mention_keywords": [
          "英雄追思日",
          "英灵殿",
          "白色鸢尾花"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "augestim",
        "section_id": "heroes_remembrance_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "golden_ears_festival",
      "title": "金穗节",
      "summary": "帝国的秋收感恩节庆，人们会编织麦秆饰物、燃起篝火，并以共享丰收来迎接金秋尾声。",
      "start": "09-26",
      "end": "09-26",
      "content_file": "public/assets/data/events/[event]金穗节.txt",
      "related_books": [
        "golden_ears_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "奥古斯提姆帝国"
        ],
        "mention_keywords": [
          "金穗节",
          "秋收感恩",
          "麦秆饰物"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "augestim",
        "section_id": "golden_ears_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "winter_welcoming_festival",
      "title": "迎冬节",
      "summary": "北境入冬前的全境节庆，人们围绕篝火举行盛大晚宴，并为孩子们制作象征御寒与平安的护符。",
      "start": "10-05",
      "end": "10-05",
      "content_file": "public/assets/data/events/[event]迎冬节.txt",
      "related_books": [
        "winter_welcoming_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟"
        ],
        "mention_keywords": [
          "迎冬节",
          "御寒护符",
          "篝火晚宴"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "winter_welcoming_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "ancestor_grand_hunt",
      "title": "先祖大狩猎",
      "summary": "诺斯加德尚武区域在入冬前举行的狩猎竞赛，猎获最多者将获得象征武勇与荣耀的“冬之牙”称号。",
      "start": "10-13",
      "end": "10-13",
      "content_file": "public/assets/data/events/[event]先祖大狩猎.txt",
      "related_books": [
        "ancestor_grand_hunt_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟"
        ],
        "mention_keywords": [
          "先祖大狩猎",
          "冬之牙",
          "尚武区域"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "ancestor_grand_hunt",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "beast_spirit_night",
      "title": "兽灵之夜",
      "summary": "乌尔芬公国的冬季节庆，萨满戴兽骨面具跳起拟兽舞，向先祖之灵与林中万兽祈求庇护与平安。",
      "start": "10-24",
      "end": "10-24",
      "content_file": "public/assets/data/events/[event]兽灵之夜.txt",
      "related_books": [
        "beast_spirit_night_guide"
      ],
      "controller": {
        "location_keywords": [
          "诺斯加德联盟",
          "乌尔芬公国",
          "林歌城"
        ],
        "mention_keywords": [
          "兽灵之夜",
          "兽骨面具",
          "动物护符"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "norsgard",
        "section_id": "beast_spirit_night",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "radiant_prayer_day",
      "title": "辉煌祈光",
      "summary": "翼民在清晨齐聚白石回廊，为圣都与飞行秩序献上祈愿的晨间圣礼，峰顶光耀会顺着礼序层层展开。",
      "start": "11-09",
      "end": "11-09",
      "content_file": "public/assets/data/events/[event]辉煌祈光.txt",
      "related_books": [
        "radiant_prayer_day_guide"
      ],
      "controller": {
        "location_keywords": [
          "翼民圣都梵尼亚",
          "白石回廊"
        ],
        "mention_keywords": [
          "辉煌祈光",
          "白石回廊",
          "飞行秩序"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "vania",
        "section_id": "radiant_prayer_day",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "sairelia_concert",
      "title": "赛瑞利亚演奏会",
      "summary": "赛瑞利亚每年一次面向全大陆旅客与居民开放的盛大演奏会，海风、潮声与歌声共同构成梦幻舞台。",
      "start": "11-30",
      "end": "11-30",
      "content_file": "public/assets/data/events/[event]赛瑞利亚演奏会.txt",
      "related_books": [
        "sairelia_concert_guide"
      ],
      "controller": {
        "location_keywords": [
          "赛瑞利亚"
        ],
        "mention_keywords": [
          "赛瑞利亚演奏会",
          "苍籁剧场",
          "海岸演奏会"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "sairelia",
        "section_id": "sairelia_concert",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "starpath_festival",
      "title": "星轨祭",
      "summary": "雾晶港在十二月举行的冬季祭典，全城会暂停大规模生产，等待海雾散去后仰望覆盖天际的绚烂极光。",
      "start": "12-05",
      "end": "12-08",
      "content_file": "public/assets/data/events/[event]星轨祭.txt",
      "related_books": [
        "starpath_festival_guide"
      ],
      "controller": {
        "location_keywords": [
          "伯伦斯法环",
          "雾晶港"
        ],
        "mention_keywords": [
          "星轨祭",
          "极光",
          "伯伦斯枢纽"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "borens",
        "section_id": "starpath_festival",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "deepblue_auction_winter",
      "title": "深蓝拍卖会",
      "summary": "大陆最高规格黑市拍卖，汇聚违禁品、稀有收藏与权贵暗盘交易。",
      "start": "12-12",
      "end": "12-12",
      "content_file": "public/assets/data/events/[event]深蓝拍卖会.txt",
      "related_books": [
        "deepblue_auction_guide"
      ],
      "controller": {
        "location_keywords": [
          "索伦蒂斯王国",
          "潮汐王座"
        ],
        "mention_keywords": [
          "深蓝拍卖会",
          "黑市拍卖"
        ],
        "reminder_days": 5
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "solentis",
        "section_id": "deepblue_auction_winter",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "star_ring_exposition",
      "title": "星环博览会",
      "summary": "由金雾商行与雾晶学院合办的高规格贸易盛会，集中展出雾晶技术、法环成果与远洋商业网络中的高端货品。",
      "start": "12-19",
      "end": "12-21",
      "content_file": "public/assets/data/events/[event]星环博览会.txt",
      "related_books": [
        "star_ring_exposition_guide"
      ],
      "controller": {
        "location_keywords": [
          "伯伦斯法环",
          "雾晶港",
          "雾晶学院"
        ],
        "mention_keywords": [
          "星环博览会",
          "金雾商行",
          "雾晶学院"
        ],
        "reminder_days": 7
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "borens",
        "section_id": "star_ring_exposition",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    },
    {
      "id": "sairelia_lantern_sea_night",
      "title": "灯海夜",
      "summary": "神恩日当夜，赛瑞利亚会点亮成片灯海，为旧岁送别并迎接新年的祈愿。",
      "start": "12-31",
      "end": "12-31",
      "content_file": "public/assets/data/events/[event]赛瑞利亚灯海夜.txt",
      "related_books": [
        "sairelia_lantern_sea_night_guide"
      ],
      "controller": {
        "location_keywords": [
          "赛瑞利亚"
        ],
        "mention_keywords": [
          "灯海夜",
          "灯海祈愿"
        ],
        "reminder_days": 3
      },
      "stages": [],
      "reminder": {
        "enabled": true,
        "group": "sairelia",
        "section_id": "sairelia_lantern_sea_night",
        "inject": {
          "role": "system",
          "depth": 0,
          "order": 1200
        }
      }
    }
  ],
  "books": [
    {
      "id": "alliance_day_guide",
      "title": "盟约日观礼手册",
      "summary": "盟约日的占位读物，后续可补成历史渊源、庆典流程与白曜城观礼须知。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_盟约日观礼手册.txt",
      "controller": {
        "mention_keywords": [
          "盟约日观礼手册"
        ],
        "theme_keywords": [
          "盟约日",
          "诺斯加德联盟"
        ]
      }
    },
    {
      "id": "longnight_watch_festival_guide",
      "title": "长夜守望节守夜手册",
      "summary": "长夜守望节的占位读物，后续可补成守夜传统、烽火仪式与永夜长垣观礼路线。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_长夜守望节守夜手册.txt",
      "controller": {
        "mention_keywords": [
          "长夜守望节守夜手册"
        ],
        "theme_keywords": [
          "长夜守望节",
          "永夜长垣"
        ]
      }
    },
    {
      "id": "undeath_day_guide",
      "title": "亡诞日纪念手册",
      "summary": "亡诞日的占位读物，后续可补成帝国往事、纪念形式与亡者都城礼仪。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_亡诞日纪念手册.txt",
      "controller": {
        "mention_keywords": [
          "亡诞日纪念手册"
        ],
        "theme_keywords": [
          "亡诞日",
          "亡灵帝国"
        ]
      }
    },
    {
      "id": "aphrodite_crown",
      "title": "阿芙罗黛蒂之冠",
      "summary": "记录倾国倾城祭的起源，以及塞壬被加冕为永久“至高的阿芙罗黛蒂”的历史。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_阿芙罗黛蒂之冠.txt",
      "controller": {
        "mention_keywords": [
          "阿芙罗黛蒂之冠"
        ],
        "theme_keywords": [
          "倾国倾城祭",
          "塞壬",
          "阿芙罗黛蒂"
        ]
      }
    },
    {
      "id": "sunreturn_festival_guide",
      "title": "耀日回归祭观礼指南",
      "summary": "耀日回归祭的占位读物，后续可补成光明回归传说、火炬仪轨与北境庆典分布。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_耀日回归祭观礼指南.txt",
      "controller": {
        "mention_keywords": [
          "耀日回归祭观礼指南"
        ],
        "theme_keywords": [
          "耀日回归祭",
          "诺斯加德联盟"
        ]
      }
    },
    {
      "id": "spring_prayer_day_guide",
      "title": "祈福日乡野巡礼",
      "summary": "祈福日的占位读物，后续可补成帝国春耕祈愿、祭坛礼节与农时习俗。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_祈福日乡野巡礼.txt",
      "controller": {
        "mention_keywords": [
          "祈福日乡野巡礼"
        ],
        "theme_keywords": [
          "祈福日",
          "奥古斯提姆帝国"
        ]
      }
    },
    {
      "id": "firstlight_rite_guide",
      "title": "初光礼仪典导览",
      "summary": "初光礼的占位读物，后续可补成圣纹意义、典礼流程与观礼禁忌。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_初光礼仪典导览.txt",
      "controller": {
        "mention_keywords": [
          "初光礼仪典导览"
        ],
        "theme_keywords": [
          "初光礼",
          "翼民圣都梵尼亚"
        ]
      }
    },
    {
      "id": "frontier_expansion_day_guide",
      "title": "开拓日位面纪行",
      "summary": "开拓日的占位读物，后续可补成六个位面故事、开拓传统与帝国纪念方式。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_开拓日位面纪行.txt",
      "controller": {
        "mention_keywords": [
          "开拓日位面纪行"
        ],
        "theme_keywords": [
          "开拓日",
          "亡灵帝国"
        ]
      }
    },
    {
      "id": "homecoming_harbor_festival_guide",
      "title": "归港节港口手册",
      "summary": "归港节的占位读物，后续可补成首航风俗、防雾灯传统与北境港口游览建议。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_归港节港口手册.txt",
      "controller": {
        "mention_keywords": [
          "归港节港口手册"
        ],
        "theme_keywords": [
          "归港节",
          "诺斯加德联盟"
        ]
      }
    },
    {
      "id": "holy_wing_review_guide",
      "title": "圣翼阅礼观礼册",
      "summary": "圣翼阅礼的占位读物，后续可补成骑士团编制、飞行表演看点与圣都礼序。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_圣翼阅礼观礼册.txt",
      "controller": {
        "mention_keywords": [
          "圣翼阅礼观礼册"
        ],
        "theme_keywords": [
          "圣翼阅礼",
          "翼民圣都梵尼亚"
        ]
      }
    },
    {
      "id": "crown_of_glory_festival_guide",
      "title": "荣耀之冠节角斗指南",
      "summary": "荣耀之冠节的占位读物，后续可补成赛制、押注风潮与阿兹哈尔观赛须知。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_荣耀之冠节角斗指南.txt",
      "controller": {
        "mention_keywords": [
          "荣耀之冠节角斗指南"
        ],
        "theme_keywords": [
          "荣耀之冠节",
          "萨赫拉联邦"
        ]
      }
    },
    {
      "id": "tome_lantern_fair_guide",
      "title": "万卷灯会白曜城导览",
      "summary": "万卷灯会的占位读物，后续可补成展区分布、学术看点与夜间灯会动线。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_万卷灯会白曜城导览.txt",
      "controller": {
        "mention_keywords": [
          "万卷灯会白曜城导览"
        ],
        "theme_keywords": [
          "万卷灯会",
          "白曜城",
          "凛冬大学"
        ]
      }
    },
    {
      "id": "huanmo_origin_story",
      "title": "幻沫与潮汐之恋：索伦蒂斯的起源",
      "summary": "讲述人鱼少女佩戴幻沫假面、协助义贼推翻旧王国，并在第七日黎明粉碎谣言的建国史诗。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_幻沫与潮汐之恋.txt",
      "controller": {
        "mention_keywords": [
          "幻沫与潮汐之恋",
          "索伦蒂斯的起源"
        ],
        "theme_keywords": [
          "索伦蒂斯",
          "起源"
        ]
      }
    },
    {
      "id": "twin_griffin_festival_guide",
      "title": "双狮鹫节帝都观礼手册",
      "summary": "双狮鹫节的占位读物，后续可补成阅兵队列、骑士比武与艾瑟嘉德活动地图。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_双狮鹫节帝都观礼手册.txt",
      "controller": {
        "mention_keywords": [
          "双狮鹫节帝都观礼手册"
        ],
        "theme_keywords": [
          "双狮鹫节",
          "奥古斯提姆帝国"
        ]
      }
    },
    {
      "id": "deepblue_auction_guide",
      "title": "深蓝拍卖会游客手册",
      "summary": "深蓝拍卖会的占位读物，后续可补成规则、看点与游客须知。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_深蓝拍卖会游客手册.txt",
      "controller": {
        "mention_keywords": [
          "深蓝拍卖会游客手册"
        ],
        "theme_keywords": [
          "深蓝拍卖会",
          "黑市拍卖"
        ]
      }
    },
    {
      "id": "imperial_exam_month_guide",
      "title": "大考月备考与观礼指南",
      "summary": "大考月的占位读物，后续可补成考试流程、应试风气与帝都旁观须知。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_大考月备考与观礼指南.txt",
      "controller": {
        "mention_keywords": [
          "大考月备考与观礼指南"
        ],
        "theme_keywords": [
          "大考月",
          "奥古斯提姆帝国"
        ]
      }
    },
    {
      "id": "stepping_star_rite_guide",
      "title": "踏星仪式报考指南",
      "summary": "踏星仪式的占位读物，后续可补成报考条件、选拔流程与雾晶学院概览。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_踏星仪式报考指南.txt",
      "controller": {
        "mention_keywords": [
          "踏星仪式报考指南"
        ],
        "theme_keywords": [
          "踏星仪式",
          "雾晶学院",
          "雾晶港"
        ]
      }
    },
    {
      "id": "sairelia_fishing_contest_guide",
      "title": "赛瑞利亚摸鱼大赛观光指南",
      "summary": "摸鱼大赛的占位读物，后续可补成赛程、参赛方式与观光路线。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚摸鱼大赛观光指南.txt",
      "controller": {
        "mention_keywords": [
          "赛瑞利亚摸鱼大赛观光指南"
        ],
        "theme_keywords": [
          "摸鱼大赛",
          "赛瑞利亚"
        ]
      }
    },
    {
      "id": "flame_dome_festival_guide",
      "title": "焰穹祭火山庆典手册",
      "summary": "焰穹祭的占位读物，后续可补成龙骑士表演、锻造赛事与风切半岛路线。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_焰穹祭火山庆典手册.txt",
      "controller": {
        "mention_keywords": [
          "焰穹祭火山庆典手册"
        ],
        "theme_keywords": [
          "焰穹祭",
          "龙吼堡垒",
          "斯卡尔公国"
        ]
      }
    },
    {
      "id": "holy_feather_coronation_guide",
      "title": "圣羽加冕仪典指引",
      "summary": "圣羽加冕的占位读物，后续可补成羽冠授予标准、观礼规则与梵尼亚荣誉体系。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_圣羽加冕仪典指引.txt",
      "controller": {
        "mention_keywords": [
          "圣羽加冕仪典指引"
        ],
        "theme_keywords": [
          "圣羽加冕",
          "翼民圣都梵尼亚"
        ]
      }
    },
    {
      "id": "jinduo_ascension_day_guide",
      "title": "金铎升华日庆典手册",
      "summary": "金铎升华日的占位读物，后续可补成献金仪式、联邦商业祈愿与节庆风貌。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_金铎升华日庆典手册.txt",
      "controller": {
        "mention_keywords": [
          "金铎升华日庆典手册"
        ],
        "theme_keywords": [
          "金铎升华日",
          "萨赫拉联邦"
        ]
      }
    },
    {
      "id": "shifting_sand_blessing_festival_guide",
      "title": "流沙祈福节旅路手册",
      "summary": "流沙祈福节的占位读物，后续可补成沙海祈愿、商旅准备与绿洲风俗。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_流沙祈福节旅路手册.txt",
      "controller": {
        "mention_keywords": [
          "流沙祈福节旅路手册"
        ],
        "theme_keywords": [
          "流沙祈福节",
          "萨赫拉联邦"
        ]
      }
    },
    {
      "id": "windbell_song_festival_guide",
      "title": "风铃欢歌节巡礼册",
      "summary": "风铃欢歌节的占位读物，后续可补成节日布置、合唱传统与赠礼习俗。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_风铃欢歌节巡礼册.txt",
      "controller": {
        "mention_keywords": [
          "风铃欢歌节巡礼册"
        ],
        "theme_keywords": [
          "风铃欢歌节",
          "翼民圣都梵尼亚"
        ]
      }
    },
    {
      "id": "golden_wave_harvest_festival_guide",
      "title": "金浪丰收祭长桌指南",
      "summary": "金浪丰收祭的占位读物，后续可补成新酿麦酒、七日宴席与琥珀加德庆典分区。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_金浪丰收祭长桌指南.txt",
      "controller": {
        "mention_keywords": [
          "金浪丰收祭长桌指南"
        ],
        "theme_keywords": [
          "金浪丰收祭",
          "琥珀加德",
          "诺德海姆公国"
        ]
      }
    },
    {
      "id": "heroes_remembrance_day_guide",
      "title": "英雄追思日纪念读本",
      "summary": "英雄追思日的占位读物，后续可补成英灵殿仪式、献花传统与战争回忆。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_英雄追思日纪念读本.txt",
      "controller": {
        "mention_keywords": [
          "英雄追思日纪念读本"
        ],
        "theme_keywords": [
          "英雄追思日",
          "奥古斯提姆帝国"
        ]
      }
    },
    {
      "id": "golden_ears_festival_guide",
      "title": "金穗节秋收手记",
      "summary": "金穗节的占位读物，后续可补成秋收习俗、麦秆工艺与帝国乡野庆典。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_金穗节秋收手记.txt",
      "controller": {
        "mention_keywords": [
          "金穗节秋收手记"
        ],
        "theme_keywords": [
          "金穗节",
          "奥古斯提姆帝国"
        ]
      }
    },
    {
      "id": "winter_welcoming_festival_guide",
      "title": "迎冬节篝火手册",
      "summary": "迎冬节的占位读物，后续可补成护符制作、篝火晚宴与北境入冬习俗。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_迎冬节篝火手册.txt",
      "controller": {
        "mention_keywords": [
          "迎冬节篝火手册"
        ],
        "theme_keywords": [
          "迎冬节",
          "诺斯加德联盟"
        ]
      }
    },
    {
      "id": "ancestor_grand_hunt_guide",
      "title": "先祖大狩猎观赛指南",
      "summary": "先祖大狩猎的占位读物，后续可补成竞赛规则、尚武传统与冬之牙称号由来。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_先祖大狩猎观赛指南.txt",
      "controller": {
        "mention_keywords": [
          "先祖大狩猎观赛指南"
        ],
        "theme_keywords": [
          "先祖大狩猎",
          "冬之牙",
          "诺斯加德联盟"
        ]
      }
    },
    {
      "id": "beast_spirit_night_guide",
      "title": "兽灵之夜林歌城巡礼",
      "summary": "兽灵之夜的占位读物，后续可补成拟兽舞、护符习俗与林歌城夜庆看点。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_兽灵之夜林歌城巡礼.txt",
      "controller": {
        "mention_keywords": [
          "兽灵之夜林歌城巡礼"
        ],
        "theme_keywords": [
          "兽灵之夜",
          "林歌城",
          "乌尔芬公国"
        ]
      }
    },
    {
      "id": "radiant_prayer_day_guide",
      "title": "辉煌祈光晨礼导览",
      "summary": "辉煌祈光的占位读物，后续可补成晨礼流程、白石回廊秩序与观礼规范。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_辉煌祈光晨礼导览.txt",
      "controller": {
        "mention_keywords": [
          "辉煌祈光晨礼导览"
        ],
        "theme_keywords": [
          "辉煌祈光",
          "翼民圣都梵尼亚"
        ]
      }
    },
    {
      "id": "sairelia_concert_guide",
      "title": "赛瑞利亚海岸演奏会导览",
      "summary": "演奏会的占位读物，后续可补成节目单、场地分区与夜游建议。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚海岸演奏会导览.txt",
      "controller": {
        "mention_keywords": [
          "赛瑞利亚海岸演奏会导览"
        ],
        "theme_keywords": [
          "赛瑞利亚演奏会",
          "海岸演奏会"
        ]
      }
    },
    {
      "id": "starpath_festival_guide",
      "title": "星轨祭极光导览",
      "summary": "星轨祭的占位读物，后续可补成停工习俗、极光观测点与雾晶港冬季活动。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_星轨祭极光导览.txt",
      "controller": {
        "mention_keywords": [
          "星轨祭极光导览"
        ],
        "theme_keywords": [
          "星轨祭",
          "雾晶港",
          "伯伦斯法环"
        ]
      }
    },
    {
      "id": "star_ring_exposition_guide",
      "title": "星环博览会商旅手册",
      "summary": "星环博览会的占位读物，后续可补成展商看点、交易礼仪与会场导览。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_星环博览会商旅手册.txt",
      "controller": {
        "mention_keywords": [
          "星环博览会商旅手册"
        ],
        "theme_keywords": [
          "星环博览会",
          "雾晶港",
          "雾晶学院"
        ]
      }
    },
    {
      "id": "sairelia_lantern_sea_night_guide",
      "title": "赛瑞利亚灯海夜祈愿手册",
      "summary": "灯海夜的占位读物，后续可补成仪式流程、祈愿习俗与夜间动线。",
      "content_file": "public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚灯海夜祈愿手册.txt",
      "controller": {
        "mention_keywords": [
          "赛瑞利亚灯海夜祈愿手册"
        ],
        "theme_keywords": [
          "灯海夜",
          "灯海祈愿"
        ]
      }
    }
  ]
} as OfficialIndexFile;

const contentMap: Record<string, string> = {
  "public/assets/data/events/[event]盟约日.txt": content0,
  "public/assets/data/events/[event]长夜守望节.txt": content1,
  "public/assets/data/events/[event]亡诞日.txt": content2,
  "public/assets/data/events/[event]倾国倾城祭.txt": content3,
  "public/assets/data/events/[event]耀日回归祭.txt": content4,
  "public/assets/data/events/[event]祈福日.txt": content5,
  "public/assets/data/events/[event]初光礼.txt": content6,
  "public/assets/data/events/[event]开拓日.txt": content7,
  "public/assets/data/events/[event]归港节.txt": content8,
  "public/assets/data/events/[event]圣翼阅礼.txt": content9,
  "public/assets/data/events/[event]荣耀之冠节.txt": content10,
  "public/assets/data/events/[event]万卷灯会.txt": content11,
  "public/assets/data/events/[event]幻沫假面祭.txt": content12,
  "public/assets/data/events/[event]双狮鹫节.txt": content13,
  "public/assets/data/events/[event]深蓝拍卖会.txt": content14,
  "public/assets/data/events/[event]大考月.txt": content15,
  "public/assets/data/events/[event]踏星仪式.txt": content16,
  "public/assets/data/events/[event]赛瑞利亚摸鱼大赛.txt": content17,
  "public/assets/data/events/[event]焰穹祭.txt": content18,
  "public/assets/data/events/[event]圣羽加冕.txt": content19,
  "public/assets/data/events/[event]金铎升华日.txt": content20,
  "public/assets/data/events/[event]流沙祈福节.txt": content21,
  "public/assets/data/events/[event]风铃欢歌节.txt": content22,
  "public/assets/data/events/[event]金浪丰收祭.txt": content23,
  "public/assets/data/events/[event]英雄追思日.txt": content24,
  "public/assets/data/events/[event]金穗节.txt": content25,
  "public/assets/data/events/[event]迎冬节.txt": content26,
  "public/assets/data/events/[event]先祖大狩猎.txt": content27,
  "public/assets/data/events/[event]兽灵之夜.txt": content28,
  "public/assets/data/events/[event]辉煌祈光.txt": content29,
  "public/assets/data/events/[event]赛瑞利亚演奏会.txt": content30,
  "public/assets/data/events/[event]星轨祭.txt": content31,
  "public/assets/data/events/[event]星环博览会.txt": content32,
  "public/assets/data/events/[event]赛瑞利亚灯海夜.txt": content33,
  "public/assets/data/books/[BOOK]旅游宣发读物_盟约日观礼手册.txt": content34,
  "public/assets/data/books/[BOOK]旅游宣发读物_长夜守望节守夜手册.txt": content35,
  "public/assets/data/books/[BOOK]旅游宣发读物_亡诞日纪念手册.txt": content36,
  "public/assets/data/books/[BOOK]旅游宣发读物_阿芙罗黛蒂之冠.txt": content37,
  "public/assets/data/books/[BOOK]旅游宣发读物_耀日回归祭观礼指南.txt": content38,
  "public/assets/data/books/[BOOK]旅游宣发读物_祈福日乡野巡礼.txt": content39,
  "public/assets/data/books/[BOOK]旅游宣发读物_初光礼仪典导览.txt": content40,
  "public/assets/data/books/[BOOK]旅游宣发读物_开拓日位面纪行.txt": content41,
  "public/assets/data/books/[BOOK]旅游宣发读物_归港节港口手册.txt": content42,
  "public/assets/data/books/[BOOK]旅游宣发读物_圣翼阅礼观礼册.txt": content43,
  "public/assets/data/books/[BOOK]旅游宣发读物_荣耀之冠节角斗指南.txt": content44,
  "public/assets/data/books/[BOOK]旅游宣发读物_万卷灯会白曜城导览.txt": content45,
  "public/assets/data/books/[BOOK]旅游宣发读物_幻沫与潮汐之恋.txt": content46,
  "public/assets/data/books/[BOOK]旅游宣发读物_双狮鹫节帝都观礼手册.txt": content47,
  "public/assets/data/books/[BOOK]旅游宣发读物_深蓝拍卖会游客手册.txt": content48,
  "public/assets/data/books/[BOOK]旅游宣发读物_大考月备考与观礼指南.txt": content49,
  "public/assets/data/books/[BOOK]旅游宣发读物_踏星仪式报考指南.txt": content50,
  "public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚摸鱼大赛观光指南.txt": content51,
  "public/assets/data/books/[BOOK]旅游宣发读物_焰穹祭火山庆典手册.txt": content52,
  "public/assets/data/books/[BOOK]旅游宣发读物_圣羽加冕仪典指引.txt": content53,
  "public/assets/data/books/[BOOK]旅游宣发读物_金铎升华日庆典手册.txt": content54,
  "public/assets/data/books/[BOOK]旅游宣发读物_流沙祈福节旅路手册.txt": content55,
  "public/assets/data/books/[BOOK]旅游宣发读物_风铃欢歌节巡礼册.txt": content56,
  "public/assets/data/books/[BOOK]旅游宣发读物_金浪丰收祭长桌指南.txt": content57,
  "public/assets/data/books/[BOOK]旅游宣发读物_英雄追思日纪念读本.txt": content58,
  "public/assets/data/books/[BOOK]旅游宣发读物_金穗节秋收手记.txt": content59,
  "public/assets/data/books/[BOOK]旅游宣发读物_迎冬节篝火手册.txt": content60,
  "public/assets/data/books/[BOOK]旅游宣发读物_先祖大狩猎观赛指南.txt": content61,
  "public/assets/data/books/[BOOK]旅游宣发读物_兽灵之夜林歌城巡礼.txt": content62,
  "public/assets/data/books/[BOOK]旅游宣发读物_辉煌祈光晨礼导览.txt": content63,
  "public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚海岸演奏会导览.txt": content64,
  "public/assets/data/books/[BOOK]旅游宣发读物_星轨祭极光导览.txt": content65,
  "public/assets/data/books/[BOOK]旅游宣发读物_星环博览会商旅手册.txt": content66,
  "public/assets/data/books/[BOOK]旅游宣发读物_赛瑞利亚灯海夜祈愿手册.txt": content67,
  "public/assets/data/reminders/诺斯加德联盟提醒.txt": content68,
  "public/assets/data/reminders/索伦蒂斯王国提醒.txt": content69,
  "public/assets/data/reminders/奥古斯提姆帝国提醒.txt": content70,
  "public/assets/data/reminders/亡灵帝国提醒.txt": content71,
  "public/assets/data/reminders/翼民圣都梵尼亚提醒.txt": content72,
  "public/assets/data/reminders/萨赫拉联邦提醒.txt": content73,
  "public/assets/data/reminders/伯伦斯法环提醒.txt": content74,
  "public/assets/data/reminders/赛瑞利亚提醒.txt": content75,
};

const reminderSectionMap: Record<string, Record<string, string>> = {
  "norsgard": {
    "alliance_day": "盟约日\n时间：01-08\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n纪念诺斯加德联盟建立的全境节庆，议会、军团与民众会在凛冬深处重申盟约与共同守土的誓言。\n主要关联区域：诺斯加德联盟、白曜城。\n常见提及关键词：盟约日、霜狼盟约、联盟建立。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "longnight_watch_festival": "长夜守望节\n时间：01-14\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n极夜最漫长的一天里，维斯格拉德公国会纪念初代守夜人，并在永夜长垣点燃绵延数百里的烽火。\n主要关联区域：诺斯加德联盟、维斯格拉德公国、永夜长垣。\n常见提及关键词：长夜守望节、初代守夜人、烽火长垣。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "sunreturn_festival": "耀日回归祭\n时间：02-15\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n极夜结束后的第一缕阳光被视为光明回归的信号，各地会点燃初王火炬与烽火共同庆祝。\n主要关联区域：诺斯加德联盟。\n常见提及关键词：耀日回归祭、初王火炬、光明回归。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "homecoming_harbor_festival": "归港节\n时间：03-19\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n海冰融化后的首航庆典，北境沿海港口会彻夜点亮防雾灯，并向海中抛洒金币祈求航运昌隆。\n主要关联区域：诺斯加德联盟、凛风渡、霜镜港、白港。\n常见提及关键词：归港节、首航、防雾灯。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "tome_lantern_fair": "万卷灯会\n时间：05-06 ~ 05-08\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n凛冬大学建院纪念日的三日开放庆典，研究成果、魔导新品与五色灯笼共同将白曜城点亮成学术与市集的盛会。\n主要关联区域：诺斯加德联盟、白曜城、凛冬大学。\n常见提及关键词：万卷灯会、凛冬大学、五色灯笼。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "flame_dome_festival": "焰穹祭\n时间：07-12\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n天陨之冠火山活动最活跃时举行的斯卡尔盛典，龙骑士巡空、龙火祭台与锻造大赛一同点燃风切半岛的夏夜。\n主要关联区域：诺斯加德联盟、斯卡尔公国、龙吼堡垒。\n常见提及关键词：焰穹祭、龙骑士、龙火祭台。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "golden_wave_harvest_festival": "金浪丰收祭\n时间：09-08 ~ 09-14\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n诺德海姆公国秋收后的七日狂欢，大公会开启第一桶新酿麦酒，各地长桌宴与流水席持续迎接四方来客。\n主要关联区域：诺斯加德联盟、诺德海姆公国、琥珀加德。\n常见提及关键词：金浪丰收祭、新酿麦酒、露天长桌。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "winter_welcoming_festival": "迎冬节\n时间：10-05\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n北境入冬前的全境节庆，人们围绕篝火举行盛大晚宴，并为孩子们制作象征御寒与平安的护符。\n主要关联区域：诺斯加德联盟。\n常见提及关键词：迎冬节、御寒护符、篝火晚宴。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "ancestor_grand_hunt": "先祖大狩猎\n时间：10-13\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n诺斯加德尚武区域在入冬前举行的狩猎竞赛，猎获最多者将获得象征武勇与荣耀的“冬之牙”称号。\n主要关联区域：诺斯加德联盟。\n常见提及关键词：先祖大狩猎、冬之牙、尚武区域。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "beast_spirit_night": "兽灵之夜\n时间：10-24\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n乌尔芬公国的冬季节庆，萨满戴兽骨面具跳起拟兽舞，向先祖之灵与林中万兽祈求庇护与平安。\n主要关联区域：诺斯加德联盟、乌尔芬公国、林歌城。\n常见提及关键词：兽灵之夜、兽骨面具、动物护符。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "solentis": {
    "goddess_beauty_contest": "倾国倾城祭\n时间：02-01 ~ 02-14\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n面向全大陆的世界级盛会，以海选、筹备巡游与终焉决赛层层筛出本年度“阿芙罗黛蒂”。\n主要关联区域：索伦蒂斯王国、银帆城。\n常见提及关键词：倾国倾城祭、阿芙罗黛蒂、选美大赛。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "huanmo_mask_festival": "幻沫假面祭\n时间：05-14 ~ 05-20\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n全民阶级消除与欲望释放的七日狂欢节。\n主要关联区域：索伦蒂斯王国。\n常见提及关键词：幻沫假面祭。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "deepblue_auction_summer": "深蓝拍卖会\n时间：06-06\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n大陆最高规格黑市拍卖，汇聚违禁品、稀有收藏与权贵暗盘交易。\n主要关联区域：索伦蒂斯王国、潮汐王座。\n常见提及关键词：深蓝拍卖会、黑市拍卖。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "deepblue_auction_winter": "深蓝拍卖会\n时间：12-12\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n大陆最高规格黑市拍卖，汇聚违禁品、稀有收藏与权贵暗盘交易。\n主要关联区域：索伦蒂斯王国、潮汐王座。\n常见提及关键词：深蓝拍卖会、黑市拍卖。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "augestim": {
    "spring_prayer_day": "祈福日\n时间：02-18\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n春耕前夕的帝国祈愿日，民众会向圣灵祈求风调雨顺、土地纯净与新一年的安稳丰收。\n主要关联区域：奥古斯提姆帝国、艾瑟嘉德。\n常见提及关键词：祈福日、春耕前夕、圣灵祈愿。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "twin_griffin_festival": "双狮鹫节\n时间：05-27\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n奥古斯提姆帝国的建立纪念日，首都将举行大阅兵、骑士比武与双头狮鹫伴飞的王权仪典。\n主要关联区域：奥古斯提姆帝国、艾瑟嘉德。\n常见提及关键词：双狮鹫节、帝国建立纪念日、双头狮鹫。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "imperial_exam_month": "大考月\n时间：06-15\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n帝国一年一度的官员选拔月度活动，围绕政治与管理能力展开多轮严苛考核，开考日即意味着整月竞争开始。\n主要关联区域：奥古斯提姆帝国、艾瑟嘉德。\n常见提及关键词：大考月、官员选拔、帝国考试。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "heroes_remembrance_day": "英雄追思日\n时间：09-18\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n帝国悼念位面入侵终结之役牺牲者的纪念日，人们会向英灵殿献上白色鸢尾花并举行追思弥撒。\n主要关联区域：奥古斯提姆帝国。\n常见提及关键词：英雄追思日、英灵殿、白色鸢尾花。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "golden_ears_festival": "金穗节\n时间：09-26\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n帝国的秋收感恩节庆，人们会编织麦秆饰物、燃起篝火，并以共享丰收来迎接金秋尾声。\n主要关联区域：奥古斯提姆帝国。\n常见提及关键词：金穗节、秋收感恩、麦秆饰物。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "undeath_empire": {
    "undeath_day": "亡诞日\n时间：01-22\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n亡灵帝国纪念全国转化为亡灵的国难之日，以亡者的“新生”回望那场鱼死网破的胜利。\n主要关联区域：亡灵帝国、伯恩·瑞瑟喃斯。\n常见提及关键词：亡诞日、全国转化为亡灵、亡灵帝国。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "frontier_expansion_day": "开拓日\n时间：03-12\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n亡灵帝国纪念六个位面开拓成果的节日，象征其对未知疆域与新位面的永恒探索意志。\n主要关联区域：亡灵帝国。\n常见提及关键词：开拓日、位面开拓、六个位面。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "vania": {
    "firstlight_rite": "初光礼\n时间：02-24\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n翼民圣都在满月之夜为新生翼民授予初始圣纹的庄严圣礼，誓言与荣光会在圣光中一同被见证。\n主要关联区域：翼民圣都梵尼亚、圣都梵尼亚。\n常见提及关键词：初光礼、初始圣纹、新生翼民。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "holy_wing_review": "圣翼阅礼\n时间：04-18\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n圣翼骑士团向圣都与教皇展示守护与荣光的空域阅兵庆典，编队飞行与圣辉仪仗构成核心看点。\n主要关联区域：翼民圣都梵尼亚、圣都梵尼亚。\n常见提及关键词：圣翼阅礼、圣翼骑士团、空域阅兵。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "holy_feather_coronation": "圣羽加冕\n时间：07-20\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n梵尼亚授予卓越翼民羽冠与名号的荣耀庆典，象征羽翼纯洁与圣纹修行已经臻于成熟。\n主要关联区域：翼民圣都梵尼亚。\n常见提及关键词：圣羽加冕、羽冠、卓越翼民。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "windbell_song_festival": "风铃欢歌节\n时间：08-22\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n梵尼亚在白石回廊与外环挂满风铃和彩带，以合唱、赠礼与祈愿祝福众翼安好的欢乐节日。\n主要关联区域：翼民圣都梵尼亚、圣都梵尼亚。\n常见提及关键词：风铃欢歌节、风铃、彩带。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "radiant_prayer_day": "辉煌祈光\n时间：11-09\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n翼民在清晨齐聚白石回廊，为圣都与飞行秩序献上祈愿的晨间圣礼，峰顶光耀会顺着礼序层层展开。\n主要关联区域：翼民圣都梵尼亚、白石回廊。\n常见提及关键词：辉煌祈光、白石回廊、飞行秩序。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "sahra": {
    "crown_of_glory_festival": "荣耀之冠节\n时间：04-26\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n萨赫拉联邦阿兹哈尔举行的年度角斗冠军大赛，冠军将以力量与鲜血夺得至高荣誉。\n主要关联区域：萨赫拉联邦、阿兹哈尔。\n常见提及关键词：荣耀之冠节、年度角斗冠军赛、阿兹哈尔。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "jinduo_ascension_day": "金铎升华日\n时间：07-28\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n萨赫拉联邦向烈日与财富之主献上黄金的宗教庆典，以祈求商业繁荣、财富流转与来年的强盛运势。\n主要关联区域：萨赫拉联邦。\n常见提及关键词：金铎升华日、金铎显现纪念日、烈日与财富之主。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "shifting_sand_blessing_festival": "流沙祈福节\n时间：08-08\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n沙暴季到来前的平安祈愿仪式，绿洲城邦与沙海商旅都会在此时为道路、水源与归途求得祝福。\n主要关联区域：萨赫拉联邦。\n常见提及关键词：流沙祈福节、沙暴季、平安祈愿。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "borens": {
    "stepping_star_rite": "踏星仪式\n时间：06-24\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n雾晶学院三年一度的招生选拔仪式，通过者将得到就读机会并正式踏入雾晶港的精英学术体系。\n主要关联区域：伯伦斯法环、雾晶港、雾晶学院。\n常见提及关键词：踏星仪式、雾晶学院、招生选拔。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "starpath_festival": "星轨祭\n时间：12-05 ~ 12-08\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n雾晶港在十二月举行的冬季祭典，全城会暂停大规模生产，等待海雾散去后仰望覆盖天际的绚烂极光。\n主要关联区域：伯伦斯法环、雾晶港。\n常见提及关键词：星轨祭、极光、伯伦斯枢纽。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "star_ring_exposition": "星环博览会\n时间：12-19 ~ 12-21\n提醒窗口：通常在开始前 7 天内进入提醒范围，并在节庆进行期间持续生效。\n由金雾商行与雾晶学院合办的高规格贸易盛会，集中展出雾晶技术、法环成果与远洋商业网络中的高端货品。\n主要关联区域：伯伦斯法环、雾晶港、雾晶学院。\n常见提及关键词：星环博览会、金雾商行、雾晶学院。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  },
  "sairelia": {
    "sairelia_fishing_contest": "摸鱼大赛\n时间：07-07\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n赛瑞利亚每年夏季举办的趣味赛事，参与者要在热闹海滨“真正摸鱼”，比拼谁能摸到最多飞天鱼。\n主要关联区域：赛瑞利亚。\n常见提及关键词：摸鱼大赛、飞天鱼、真正的摸鱼。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "sairelia_concert": "赛瑞利亚演奏会\n时间：11-30\n提醒窗口：通常在开始前 5 天内进入提醒范围，并在节庆进行期间持续生效。\n赛瑞利亚每年一次面向全大陆旅客与居民开放的盛大演奏会，海风、潮声与歌声共同构成梦幻舞台。\n主要关联区域：赛瑞利亚。\n常见提及关键词：赛瑞利亚演奏会、苍籁剧场、海岸演奏会。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。",
    "sairelia_lantern_sea_night": "灯海夜\n时间：12-31\n提醒窗口：通常在开始前 3 天内进入提醒范围，并在节庆进行期间持续生效。\n神恩日当夜，赛瑞利亚会点亮成片灯海，为旧岁送别并迎接新年的祈愿。\n主要关联区域：赛瑞利亚。\n常见提及关键词：灯海夜、灯海祈愿。\n当剧情位于上述区域，或对话开始涉及该节庆、其仪式、赛事、庆典氛围、游客活动时，应把它视为当前值得提醒的时令事件，并允许系统提示其临近或正在举行。"
  }
};

const referencedContentFiles = new Set(
  [
    ...officialIndexData.festivals.map(item => item.content_file),
    ...officialIndexData.books.map(item => item.content_file),
    ...(officialIndexData.reminder_groups ?? []).map(item => item.content_file),
  ]
    .map(filePath => String(filePath || '').trim().replaceAll('\\', '/'))
    .filter(Boolean),
);
const warnedMissingContentFiles = new Set<string>();

function warnMissingOfficialContent(filePath: string): void {
  if (!filePath || warnedMissingContentFiles.has(filePath)) {
    return;
  }
  warnedMissingContentFiles.add(filePath);
  console.warn(`[calendar-float] 官方索引引用的正文文件缺失或为空：${filePath}`);
}

referencedContentFiles.forEach(filePath => {
  if (!contentMap[filePath]) {
    warnMissingOfficialContent(filePath);
  }
});

export function getOfficialIndexData(): OfficialIndexFile {
  return officialIndexData;
}

export function getOfficialTextContent(filePath: string): string {
  const normalizedPath = String(filePath || '').trim().replaceAll('\\', '/');
  if (!normalizedPath) {
    return '';
  }

  const content = String(contentMap[normalizedPath] || '').trim();
  if (!content && referencedContentFiles.has(normalizedPath)) {
    warnMissingOfficialContent(normalizedPath);
  }
  return content;
}

export function getOfficialReminderSectionContent(groupId: string, sectionId: string): string {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedSectionId = String(sectionId || '').trim();
  if (!normalizedGroupId || !normalizedSectionId) {
    return '';
  }
  return String(reminderSectionMap[normalizedGroupId]?.[normalizedSectionId] || '').trim();
}

export function getOfficialReminderSectionMap(groupId: string): Record<string, string> {
  const normalizedGroupId = String(groupId || '').trim();
  if (!normalizedGroupId) {
    return {};
  }
  return { ...(reminderSectionMap[normalizedGroupId] ?? {}) };
}
