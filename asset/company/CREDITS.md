# 이미지 출처 기록 (asset/company)

**기업 로고는 각 기업의 상표이며, 본 프로젝트에서는 개인정보 유출 사고의 기업 식별 목적으로만 사용합니다. 본 프로젝트는 해당 기업과 공식적인 제휴 또는 관련이 없습니다. (학교 교육 과정의 비상업적 프로젝트입니다.)**

실제 사고 카드에 쓰는 기업 로고 60개입니다. 각 사고의 `thumbnail` 필드로 연결하며, 같은 기업의 사고가 여러 건이면 같은 파일을 함께 씁니다(사고 63건 연결). 이미지가 없거나 불러오지 못하면 회색 칸으로 표시합니다.

| 항목 | 내용 |
| --- | --- |
| 수집 | 팀원이 기업·기관 공식 페이지에서 수집하고 출처를 기록(엑셀 `LeakBase_image.xlsx`) |
| 수집·확인일 | 2026-11-14 ~ 2026-11-15 |
| 가공 | 긴 변이 800px을 넘는 파일은 800px로 축소. 카카오(06)는 글자 주변 중앙부만 잘라 사용. KT(03)는 SVG를 PNG로 변환하고 로고만 잘라 사용. 로고 모양은 바꾸지 않음 |
| 출처 종류 | 기업 공식 또는 기관 공식 페이지 |

## 출처 표

`출처 URL`은 로고를 확인한 페이지 주소입니다. 직접 이미지 파일 주소가 없는 행은 비고에 적었습니다.

| 파일명 | 기업명 | 사고 ID | 출처 URL | 출처 종류 | 확인일 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| `01_sk-telecom.png` | SK텔레콤 | KR-001 | https://news.sktelecom.com/about-newsroom | 기업 공식 | 2026-11-16 | 공식 홈페이지(sktelecom.com)의 대표 이미지(`skt-seo.jpg`, 1200×630)를 팀원이 받아 JPG를 PNG로 변환한 파일. 직접 이미지 URL: https://www.sktelecom.com/images/seo/skt-seo.jpg. 뉴스룸 CI·로고 안내: https://news.sktelecom.com/135467(출처 표기 시 공유·인용 가능). 교체본(이전 파일의 체크무늬 배경 문제) |
| `02_coupang.jpg` | 쿠팡 | KR-002, KR-016 | https://news.coupang.com/archives/1257/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `03_kt.png` | KT | KR-003 | https://corp.kt.com/eng/html/intro/design/design.html | 기업 공식 | 2026-11-16 | 직접 이미지 URL: https://corp.kt.com/images/kt/design/img_ci.svg?ver=2026050701a. KT 공식 디자인(CI·VI) 페이지의 CI 이미지(SVG, 팀원 제공)에서 로고 부분만 잘라 PNG로 변환하고 회색 배경은 제거함. 이전 파일(구글 이미지 검색, 이로운넷 기사 이미지)을 교체함 |
| `04_gs-retail.png` | GS리테일 | KR-005 | https://hpsimg.gsretail.com/gsretail/ko/intro/ci-bi?tab=1 | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `05_yes24.png` | 예스24 | KR-006 | https://company.yes24.com/yes24/CI | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `06_kakao.png` | 카카오 | KR-007 | https://www.kakaocorp.com/page/detail/11340 | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음. 카카오 본사 공식 CI 이미지이며 파일명이 직접 이미지 URL의 파일명과 일치함. 비상업적 이용만 가능. 글자 주변 중앙부만 잘라 사용(노란 배경 유지). 카카오T 로고를 교체한 파일 |
| `07_tmoney.jpg` | 티머니 | KR-044 | https://tmoney.co.kr/aeb/cmnctn/ci/ci.dev | 기업 공식 | 2026-11-16 | 공식 CI/BI 페이지의 "CI 다운로드" 파일 중 `CI_Eng_V_Color_G.jpg`(148×178, 영문 세로형 컬러 로고)로 팀원이 확인해 제공한 이미지를 JPG로 저장해 사용. 직접 이미지 URL 미확보. 이전 파일(구글 이미지 검색, 459×435)을 교체함 |
| `08_golfzon.png` | 골프존 | KR-008 | https://news.golfzon.com/ko/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `09_modetour.png` | 모두투어 | KR-009 | https://www.modetournetwork.com/company/bi | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `10_lg-uplus.jpg` | LG유플러스 | KR-011 | https://news.lguplus.com/12690 | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `11_kcss-social-welfare.png` | 한국사회복지협의회 | KR-012 | https://www.bokji.net/ssn/inf/04.bokji | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `12_keis-worknet.jpg` | 한국고용정보원 | KR-013-a | https://www.keis.or.kr/keis/ko/conts/245/web.do | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `13_kosaf.jpg` | 한국장학재단 | KR-013-b | https://www.kosaf.go.kr/ko/info.do?naviParam=DN%2C00%2C04%2C00&pg=ci01_01 | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `14_sk-stoa.png` | SK스토아 | KR-014 | https://corp.skstoa.com/pcweb/ci | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `15_donghaeng-lottery.jpg` | 동행복권 | KR-015 | https://www.dhlottery.co.kr/csgmBzmnInfo?tabNo=1 | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `16_millie.png` | 밀리의서재 | KR-017 | https://company.millie.co.kr/company/intro/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `17_weolbu.jpg` | 월급쟁이부자들 | KR-018 | https://recruit.weolbu.com/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `18_verygoodtour.jpg` | 참좋은여행 | KR-020 | https://verygoodtourcompany.com/about/summary | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `19_hanwha-hotels-resorts.jpg` | 한화호텔앤드리조트 | KR-021 | https://www.hwrc.co.kr/hwrc/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `20_interpark.jpg` | 인터파크 | KR-022, KR-205 | https://tmanager.interpark.com/html/BInotice.html | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준); 현재 로고이며 사고 당시와 다를 수 있음 |
| `21_nexon.png` | 넥슨 | KR-024 | https://brand.nexon.com/en/ci-brand-guidelines/primary-identity | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `22_kb-kookmin-card.png` | KB국민카드 | KR-028-a | https://card.kbcard.com/SVC/DVIEW/HSJMCXCROCIC0025 | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `23_nh-nonghyup-card.jpg` | NH농협카드 | KR-028-c | https://card.nonghyup.com/file/ebank/product/info/M21013.pdf | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `24_hanatour.jpg` | 하나투어 | KR-029 | https://www.hanatourcompany.com/kr/company/ci | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `25_yeogi-eottae.png` | 여기어때(위드이노베이션) | KR-031 | https://designlibrary.yeogi.com/brand/logo/ci | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `26_sk-communications.jpg` | SK커뮤니케이션즈 | KR-023 | https://www.natecorp.com/about_history | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준); 현재 로고이며 사고 당시와 다를 수 있음 |
| `27_louis-vuitton-korea.png` | 루이비통코리아 | KR-035-a | https://kr.louisvuitton.com/kor-kr/homepage | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `28_christian-dior-couture-korea.jpg` | 크리스챤디올꾸뛰르코리아 | KR-035-b | https://www.dior.com/ko_kr | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `29_tiffany-korea.jpg` | 티파니코리아 | KR-035-c | https://www.tiffany.kr/policy/trademarks-copyrights.html | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `30_tving.jpg` | 티빙 | KR-040 | https://team.tving.com/1582d1a8-9f4c-8012-92b1-e00f1ea5b14b | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `31_incruit.png` | 인크루트 | KR-042, KR-438 | https://info.incruit.com/introduce/ci.asp | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `32_nrf.jpg` | 한국연구재단 | KR-043 | https://www.nrf.re.kr/ | 기관 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `33_bithumb.png` | 빗썸(비티씨코리아닷컴) | KR-045 | https://www.bithumbcorp.com/ko/promotion/bi.php | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `34_gangnamunni.png` | 강남언니 | KR-046 | https://www.gangnamunni.com/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준); 현재 로고이며 사고 당시와 다를 수 있음 |
| `35_rda.jpg` | 농촌진흥청 | KR-048-a | https://www.rda.go.kr/board/board.do?mode=html&prgId=ogi_ciintrQuery | 기관 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `36_misotech.jpg` | 미소테크 | KR-048-b | https://rfmiso.com/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `37_daekyo.png` | 대교 | KR-051 | https://www.daekyo.com/kr/daekyo/company/ci | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `38_jbnu.jpg` | 전북대학교 | KR-101 | https://www.jbnu.ac.kr/web/intro/university/sub05.do | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `39_ewha.png` | 이화여자대학교 | KR-102 | https://www.ewha.ac.kr/ewha/intro/ui-si02.do | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `40_topik-edu-center.png` | 한국토픽교육센터 | KR-104 | https://edutpk.co.kr/company/hello.php | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `41_reebonz.jpg` | 리본즈 | KR-206 | https://www.reebonz.co.kr/page/about | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `42_paxnet.png` | 팍스넷 | KR-207 | https://www.paxnet.co.kr/corporation/ciIntroducion | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `43_dreamus-company.jpg` | 드림어스컴퍼니 | KR-208 | https://www.dreamuscompany.com/company/aboutus | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `44_gosia-academy.png` | 고시아카데미 | KR-209 | https://www.instv.net/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `45_musinsa.jpg` | 무신사 | KR-210 | https://prd-new.corp.musinsa.com/company | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `46_speedauction.jpg` | 스피드옥션 | KR-213 | https://www.speedauction.co.kr/ | 기업 공식 | 2026-11-14 | 직접 이미지 URL 있음 |
| `47_hallym-polytechnic.png` | 한림성심대학교 | KR-214 | https://www.hsc.ac.kr/site/hsc/sub.do?idx=2&key=28 | 기관 공식 | 2026-11-14 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `48_locknlock.png` | 락앤락 | KR-373 | https://www.locknlock.com/kor/about/brand | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `49_ubase.jpg` | 유베이스 | KR-374 | https://www.ubase.co.kr/ | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준); 그룹(U BASE GROUP) 로고. 법인 개별 CI와 같은지 미확인 |
| `50_sunphoto.jpg` | 썬포토 | KR-375 | https://sunphoto.kr/shopinfo/company.html | 기업 공식 | 2026-11-15 | 직접 이미지 URL 있음 |
| `51_duo.png` | 듀오정보 | KR-301 | https://www.duo.co.kr/html/company/company_ci.asp | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `52_geumneung-park.png` | 금릉공원묘원 | KR-302 | https://www.grpark.co.kr/story/introduce | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `53_cj-enm.jpg` | CJ ENM | KR-442 | https://www.cjenm.com/ko/download/ | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준); 미디어 라이브러리 자산은 상업적 이용 불가 안내가 있음(본 프로젝트는 비상업적) |
| `54_mcdonalds.jpg` | 한국맥도날드 | KR-340 | https://corporate.mcdonalds.com/corpmcd/our-stories/media-assets-library/logos.html | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준); 글로벌 브랜드 로고(한국맥도날드 법인 CI 아님) |
| `55_hyundai-motor.jpg` | 현대자동차 | KR-418 | https://www.hyundai.com/kr/ko/info/ci | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `56_jejuair.jpg` | 제주항공 | KR-349 | https://www.jejuair.net/ko/about/corp/page.do | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `57_skhynix.jpg` | SK하이닉스 | KR-319 | https://news.skhynix.com/en/sk-hynix_ci-corporate-identity/ | 기업 공식 | 2026-11-15 | 직접 이미지 URL 있음; 영문 CI |
| `58_kyobo.jpg` | 교보문고 | KR-407 | https://design.kyobobook.co.kr/brand/logo | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |
| `59_asiana-airlines.jpg` | 아시아나항공 | KR-318 | https://flyasiana.com/C/CN/KO/contents/ci | 기업 공식 | 2026-11-15 | 직접 이미지 URL 있음 |
| `60_kyochonfnb.jpg` | 교촌에프앤비 | KR-409 | https://www.kyochonfnb.com/prcenter/ci.do | 기업 공식 | 2026-11-15 | 직접 이미지 URL 미확보(출처 페이지 기준) |

## 사용 시 주의

- 비고에 '현재 로고이며 사고 당시와 다를 수 있음'이라고 적힌 이미지는 사고 당시의 로고가 아닐 수 있습니다.
- 출처 URL을 확인한 날짜 기준의 기록이며, 기업의 로고 변경이나 사용 조건 변경은 반영되지 않을 수 있습니다.
