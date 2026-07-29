window.CONTENT_ZH = {
  nav: {
    about: '关于我',
    skills: '技能',
    experience: '经历',
    projects: '项目',
    achievements: '成果',
    gallery: '生活',
    contact: '联系'
  },
  hero: {
    eyebrow: 'DATA ANALYST · AI 实践者',
    slogan: '用数据解决问题，用 AI 提升效率，把创意变成真正可落地的产品。',
    ctaProjects: '查看项目',
    ctaResume: '下载简历',
    ctaContact: '联系我'
  },
  about: {
    eyebrow: 'ABOUT ME',
    lead: '应用统计硕士，拥有 KN Group、蔚来等三段数据分析实习经历，具备经营分析、风险分析及预测建模能力。熟练使用 SQL、Python 与 Tableau 开展业务分析，并能够利用 AI 工具开发自动化分析脚本和效率工具，将数据分析流程产品化，持续提升业务决策效率。',
    title: '关于我',
    labelName: '姓名',
    labelCity: '所在城市',
    valueCity: '上海',
    labelEducation: '学历',
    valueEducation: '东华大学 · 应用统计硕士（211，27届毕业生）',
    labelFocus: '职业方向',
    valueFocus: '数据分析 · 风险分析',
    labelResearch: '研究方向',
    valueResearch: '经营分析、风险建模、预测建模',
    labelHobbies: '兴趣爱好',
    valueHobbies: '阅读、普拉提、游泳、尤克里里、旅行'
  },
  skills: { eyebrow: 'SKILLS', title: '技能' },
  experience: {
    eyebrow: 'EXPERIENCE',
    title: '经历',
    knGroup: {
      company: 'KN Group', period: '2026.06 – 2026.08', role: '数据分析实习生',
      bullet1: '从 0 到 1 搭建注册→授信→放款→还款全链路转化漏斗及风险收益监控体系，持续跟踪注册成本、放款率、坏账率、CPS 等核心指标，为业务决策提供实时数据支撑',
      bullet2: '基于 Python 搭建坏账预测模型，完成多版本情景模拟及资产质量测算，辅助风险策略调整',
      bullet3: '开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成，大幅减少人工整理时间',
      highlight: '大幅提升周报/月报产出效率'
    },
    nio: {
      company: '上海蔚来汽车有限公司', period: '2026.01 – 2026.06', role: '服务运营（数据分析方向）实习生',
      bullet1: '独立搭建月度运营数据报表体系，基于 SQL 完成业务数据提取、指标口径统一及数据可视化，为跨部门汇报提供统一数据口径',
      bullet2: '跟踪换电站运营表现及 VOC 用户反馈，构建问题分类体系并输出专题分析报告，协助运营团队定位高频问题',
      bullet3: '深度参与春节、五一能源保障项目，负责运营数据监控与复盘分析，保障重大节假日期间服务稳定性',
      highlight: '保障运营数据 100% 准确及时输出',
      tagViz: '数据可视化'
    },
    zhouji: {
      company: '上海洲暨科技有限公司', period: '2025.01 – 2025.05', role: '数据分析实习生',
      bullet1: '利用 MySQL 从 CRM 系统数据库获取交易数据，通过统计方法总结数据特征，识别客户行为规律',
      bullet2: '使用 Tableau 发现数据中的模式、趋势和异常数据，制作可视化看板辅助团队决策',
      bullet3: '通过数据分析发现业务中的潜在问题或机会，推动业务优化',
      highlight: '交易率较三个月前提升 20%'
    }
  },
  projects: {
    eyebrow: 'FEATURED PROJECTS',
    title: '项目',
    supplyChain: {
      badge: '国竞一等奖',
      title: '爆品供应链全渠道库存优化与风险建模研究',
      desc1: '构建 ARIMAX+TCN 需求预测模型，完成分渠道/分区域 13 周预测与风险区间测算',
      desc2: '设计 MPC 动态库存优化框架，基于 XGBoost-SHAP 搭建风险传导模型',
      metric: '库存周转率 +241.2% · 总成本 -25% · 服务水平 98.83%'
    },
    insurance: {
      badge: '美国 MCM Honorable Mention',
      title: '保险公司承保评级系统',
      desc1: '基于巨灾模型计算保险公司预期损失',
      desc2: '通过泊松分布仿真模拟随机生成损失总价值和极端天气发生概率',
      desc3: '采用空间分析技术构建 Bankruptcy Index Model',
      metric: '覆盖 146 个国家、16 万条数据'
    },
    automation: {
      badge: 'KN Group 实习产出',
      title: '业务自动化分析工具',
      desc1: '基于 Python（Pandas、OpenPyXL）开发自动化数据分析工具',
      desc2: '实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成',
      metric: '大幅提升周报/月报产出效率'
    },
    website: {
      badge: 'AI 实践',
      title: '个人展示网页 / 简历投递辅助工具',
      desc1: '利用 AI 完成个人展示网页及简历投递辅助工具开发',
      desc2: '实现网页快速搭建与功能验证'
    },
    attendance: {
      badge: '大数据课程项目',
      title: '学生考勤管理系统',
      desc1: '基于 MySQL + Python(Tkinter) 搭建的学生考勤管理平台',
      desc2: '实现学生/班级/考勤信息增删改查',
      desc3: '并用 Matplotlib 提供班级出勤率对比、考勤类型占比、个人考勤趋势等多维度可视化分析',
      metric: '覆盖 10 个班级、200 名学生、600+ 条考勤记录（模拟数据集）'
    }
  },
  achievements: {
    eyebrow: 'ACHIEVEMENTS',
    title: '成果',
    internships: '段数据分析实习经历',
    projects: '个核心项目',
    awards: '项国家级/国际级竞赛奖项',
    kpis: '项核心业务指标监控体系',
    list: {
      knGroup: 'KN Group',
      nio: '上海蔚来汽车有限公司',
      zhouji: '上海洲暨科技有限公司',
      award1: '全国大数据建模大赛一等奖',
      award2: '"华为杯"国家级数学建模竞赛三等奖',
      award3: '美国大学生数学建模竞赛 Honorable Mention',
      kpi1: '注册成本 / CAC',
      kpi2: '放款率与坏账率',
      kpi3: 'CPS',
      kpi4: '运营数据准确率'
    }
  },
  gallery: {
    eyebrow: 'GALLERY',
    title: '生活',
    travel: '旅行', reading: '阅读', swim: '游泳', ukulele: '尤克里里',
    pilates: '普拉提', award: '获奖时刻', billiards: '台球', friends: '朋友时光',
    travelCaption: '旅行是我和朋友们的固定节目：轮流组队当"导游"，那一次由导游全权安排行程，其余人无条件跟随——目前已经轮了好几轮。',
    drawCta: '抽一张'
  },
  contact: {
    eyebrow: 'CONTACT',
    title: '联系我',
    emailLabel: '邮箱',
    resumeLabel: '简历',
    resumeCta: '下载简历'
  },
  footer: { slogan: '一起创造点了不起的东西。' }
};

window.CONTENT_EN = {
  nav: {
    about: 'About',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Projects',
    achievements: 'Achievements',
    gallery: 'Gallery',
    contact: 'Contact'
  },
  hero: {
    eyebrow: 'DATA ANALYST · AI PRACTITIONER',
    slogan: 'Solving problems with data, boosting efficiency with AI, turning ideas into products that actually ship.',
    ctaProjects: 'View Projects',
    ctaResume: 'Download Resume',
    ctaContact: 'Contact Me'
  },
  about: {
    eyebrow: 'ABOUT ME',
    lead: 'M.S. in Applied Statistics with three data-analytics internships at KN Group, NIO, and beyond, bringing hands-on experience in business analytics, risk analysis, and predictive modeling. Proficient in SQL, Python, and Tableau for business analysis, and skilled at using AI tools to build automated analysis scripts and efficiency tools — productizing the data-analysis workflow to continuously improve business decision-making.',
    title: 'About Me',
    labelName: 'Name',
    labelCity: 'City',
    valueCity: 'Shanghai, China',
    labelEducation: 'Education',
    valueEducation: 'Donghua University · M.S. Applied Statistics (Class of 2027)',
    labelFocus: 'Focus',
    valueFocus: 'Data Analysis · Risk Analytics',
    labelResearch: 'Research Interests',
    valueResearch: 'Business Analytics, Risk Modeling, Forecasting',
    labelHobbies: 'Hobbies',
    valueHobbies: 'Reading, Pilates, Swimming, Ukulele, Travel'
  },
  skills: { eyebrow: 'SKILLS', title: 'Skills' },
  experience: {
    eyebrow: 'EXPERIENCE',
    title: 'Experience',
    knGroup: {
      company: 'KN Group', period: 'Jun 2026 – Aug 2026', role: 'Data Analyst Intern',
      bullet1: 'Built the full registration → credit → disbursement → repayment funnel and risk/return monitoring system from scratch, continuously tracking KPIs including CAC, disbursement rate, NPL rate, and CPS to support real-time business decisions',
      bullet2: 'Built bad-debt prediction models in Python and ran multi-scenario simulations for asset-quality assessment, informing risk strategy adjustments',
      bullet3: 'Developed automated analysis tooling for disbursement volume, asset performance, and NPL rate, with auto data cleaning, pivoting, and Excel report generation, substantially cutting manual processing time',
      highlight: 'Significantly sped up weekly/monthly report turnaround'
    },
    nio: {
      company: 'NIO Inc.', period: 'Jan 2026 – Jun 2026', role: 'Service Operations (Data Analytics) Intern',
      bullet1: 'Independently built a monthly operations reporting system, using SQL for data extraction, metric standardization, and visualization, giving cross-team reporting a single consistent data source',
      bullet2: 'Tracked battery-swap station performance and VOC feedback, built an issue-classification framework and published thematic reports, helping the operations team pinpoint high-frequency issues',
      bullet3: 'Supported Spring Festival and Labor Day energy-assurance projects with operations monitoring and post-mortem analysis, helping keep service stable during major holidays',
      highlight: 'Kept operations data 100% accurate and on time',
      tagViz: 'Data Visualization'
    },
    zhouji: {
      company: 'Shanghai Zhouji Technology', period: 'Jan 2025 – May 2025', role: 'Data Analyst Intern',
      bullet1: 'Pulled transaction data from the CRM database via MySQL and summarized data characteristics using statistical methods, identifying customer behavior patterns',
      bullet2: 'Used Tableau to surface patterns, trends, and anomalies in the data, building dashboards to support team decisions',
      bullet3: 'Turned analysis into action by working directly with the business to fix root-cause issues',
      highlight: 'Lifted the transaction rate by 20% within three months'
    }
  },
  projects: {
    eyebrow: 'FEATURED PROJECTS',
    title: 'Projects',
    supplyChain: {
      badge: '1st Prize, National Competition',
      title: 'Omni-Channel Inventory Optimization & Risk Modeling for Hero SKUs',
      desc1: 'Built an ARIMAX+TCN demand forecasting model with 13-week forecasts and risk intervals by channel/region',
      desc2: 'Designed an MPC dynamic inventory framework and an XGBoost-SHAP risk propagation model',
      metric: 'Inventory turnover +241.2% · Total cost -25% · Service level 98.83%'
    },
    insurance: {
      badge: 'US MCM Honorable Mention',
      title: 'Insurance Underwriting Rating System',
      desc1: 'Estimated insurer expected losses via catastrophe modeling',
      desc2: 'Simulated loss severity and extreme-weather probability with Poisson processes',
      desc3: 'Built a spatial Bankruptcy Index Model',
      metric: 'Covered 146 countries, 160K+ data points'
    },
    automation: {
      badge: 'KN Group Internship Output',
      title: 'Business Automation Analytics Tool',
      desc1: 'Built automated analysis tooling in Python (Pandas, OpenPyXL)',
      desc2: 'Auto-cleans, pivots, and generates Excel reports across disbursement, asset performance, and NPL data',
      metric: 'Significantly sped up weekly/monthly reporting'
    },
    website: {
      badge: 'AI Practice',
      title: 'Personal Site / Resume-Application Assistant Tool',
      desc1: 'Built a personal showcase site and a resume-application assistant tool with AI-assisted development',
      desc2: 'From rapid scaffolding to feature validation'
    },
    attendance: {
      badge: 'Big Data Course Project',
      title: 'Student Attendance Management System',
      desc1: 'Built a MySQL + Python (Tkinter) attendance management platform',
      desc2: 'Full CRUD for students/classes/attendance records',
      desc3: 'Plus Matplotlib-powered analytics — class attendance-rate comparisons, attendance-type breakdowns, and individual student trends',
      metric: 'Covers 10 classes, 200 students, 600+ attendance records (simulated dataset)'
    }
  },
  achievements: {
    eyebrow: 'ACHIEVEMENTS',
    title: 'Achievements',
    internships: 'Data analytics internships',
    projects: 'Core projects delivered',
    awards: 'National / international competition awards',
    kpis: 'Core KPI monitoring systems built',
    list: {
      knGroup: 'KN Group',
      nio: 'NIO Inc.',
      zhouji: 'Shanghai Zhouji Technology',
      award1: '1st Prize, National Big Data Modeling Competition',
      award2: 'Huawei Cup National Mathematical Modeling Competition, 3rd Prize',
      award3: 'US MCM Honorable Mention',
      kpi1: 'CAC (Customer Acquisition Cost)',
      kpi2: 'Disbursement rate & NPL rate',
      kpi3: 'CPS',
      kpi4: 'Operations data accuracy'
    }
  },
  gallery: {
    eyebrow: 'GALLERY',
    title: 'Gallery',
    travel: 'Travel', reading: 'Reading', swim: 'Swimming', ukulele: 'Ukulele',
    pilates: 'Pilates', award: 'Award Moments', billiards: 'Billiards', friends: 'With Friends',
    travelCaption: 'Travel is a running tradition with my friends: we take turns being the "tour guide" for a trip — that person plans everything, and everyone else follows without question. We\'ve been through several rounds already.',
    drawCta: 'Draw a Card'
  },
  contact: {
    eyebrow: 'CONTACT',
    title: 'Contact Me',
    emailLabel: 'Email',
    resumeLabel: 'Resume',
    resumeCta: 'Download Resume'
  },
  footer: { slogan: "Let's Build Something Amazing Together." }
};
