// 模拟帖子桌面字号增强：运行时向 <head> 注入 <style>，随 JS 包加载，
// 不经过构建器 CSS 管线，也不存在外链 CSS 缓存问题，兼容性最强。
// 放大系数 --mk 统一控制（1.3 = 放大 30%）；!important 确保覆盖全局样式表与任何加载顺序。

export const MOCK_FONT_SCALE_STYLE_ID = "b-preview-mock-font-scale";

const MOCK_FONT_SCALE_CSS = `
.mockType{--mk:1.3}
/* 通用手机拟真帖 / 微博 / 文案卡 */
.mockType .phone-top{font-size:calc(9px*var(--mk))!important}
.mockType .post-top{font-size:calc(11px*var(--mk))!important}
.mockType .post-hero>span{font-size:calc(8px*var(--mk))!important}
.mockType .hero-mark{font-size:calc(12px*var(--mk))!important}
.mockType .post-hero strong{font-size:calc(17px*var(--mk))!important}
.mockType .post-body h3{font-size:calc(13px*var(--mk))!important}
.mockType .post-body p,.mockType .weibo-card>p,.mockType .script-section p{font-size:calc(10px*var(--mk))!important}
.mockType .hashtags,.mockType .weibo-tags{font-size:calc(10px*var(--mk))!important}
.mockType .post-author{font-size:calc(10px*var(--mk))!important}
.mockType .post-author small{font-size:calc(8px*var(--mk))!important}
.mockType .social-bar span{font-size:calc(9px*var(--mk))!important}
.mockType .weibo-profile strong{font-size:calc(11px*var(--mk))!important}
.mockType .weibo-profile small{font-size:calc(9px*var(--mk))!important}
.mockType .verified{font-size:calc(7px*var(--mk))!important}
.mockType .weibo-grid div{font-size:calc(13px*var(--mk))!important}
.mockType .weibo-footer{font-size:calc(9px*var(--mk))!important}
.mockType .script-cover span{font-size:calc(8px*var(--mk))!important}
.mockType .script-cover h3{font-size:calc(17px*var(--mk))!important}
.mockType .script-cover p{font-size:calc(9px*var(--mk))!important}
.mockType .script-section h4{font-size:calc(11px*var(--mk))!important}
.mockType .shot>span,.mockType .shot strong{font-size:calc(10px*var(--mk))!important}
.mockType .shot small{font-size:calc(9px*var(--mk))!important}
/* Reddit */
.mockType .reddit-bar strong{font-size:calc(17px*var(--mk))!important}
.mockType .reddit-bar span{font-size:calc(10px*var(--mk))!important}
.mockType .reddit-bar button{font-size:calc(9px*var(--mk))!important}
.mockType .reddit-post aside strong{font-size:calc(9px*var(--mk))!important}
.mockType .reddit-post aside button{font-size:calc(13px*var(--mk))!important}
.mockType .reddit-meta{font-size:calc(8px*var(--mk))!important}
.mockType .reddit-post h3{font-size:calc(15px*var(--mk))!important}
.mockType .reddit-post p{font-size:calc(10px*var(--mk))!important}
.mockType .reddit-flairs span{font-size:calc(8px*var(--mk))!important}
.mockType .reddit-post footer{font-size:calc(9px*var(--mk))!important}
/* Discord */
.mockType .discord-shell>aside span{font-size:calc(11px*var(--mk))!important}
.mockType .discord-main>header strong{font-size:calc(11px*var(--mk))!important}
.mockType .discord-main>header small{font-size:calc(8px*var(--mk))!important}
.mockType .discord-date{font-size:calc(8px*var(--mk))!important}
.mockType .discord-author strong{font-size:calc(11px*var(--mk))!important}
.mockType .discord-author span{font-size:calc(6px*var(--mk))!important}
.mockType .discord-author small{font-size:calc(7px*var(--mk))!important}
.mockType .discord-message h3{font-size:calc(12px*var(--mk))!important}
.mockType .discord-message p{font-size:calc(9px*var(--mk))!important}
.mockType .discord-tags{font-size:calc(8px*var(--mk))!important}
.mockType .discord-reactions span{font-size:calc(8px*var(--mk))!important}
.mockType .discord-input{font-size:calc(9px*var(--mk))!important}
/* Instagram */
.mockType .instagram-head strong{font-size:calc(17px*var(--mk))!important}
.mockType .instagram-head span{font-size:calc(15px*var(--mk))!important}
.mockType .instagram-profile strong{font-size:calc(9px*var(--mk))!important}
.mockType .instagram-profile small{font-size:calc(8px*var(--mk))!important}
.mockType .ig-avatar i{font-size:calc(10px*var(--mk))!important}
.mockType .instagram-hero>span{font-size:calc(7px*var(--mk))!important}
.mockType .instagram-hero div small{font-size:calc(7px*var(--mk))!important}
.mockType .instagram-hero div strong{font-size:calc(19px*var(--mk))!important}
.mockType .instagram-caption strong{font-size:calc(8px*var(--mk))!important}
.mockType .instagram-caption p{font-size:calc(8.5px*var(--mk))!important}
.mockType .instagram-caption div{font-size:calc(8px*var(--mk))!important}
.mockType .instagram-caption small{font-size:calc(7px*var(--mk))!important}
/* TikTok */
.mockType .tiktok-top{font-size:calc(10px*var(--mk))!important}
.mockType .tiktok-scene-copy small{font-size:calc(7px*var(--mk))!important}
.mockType .tiktok-scene-copy strong{font-size:calc(19px*var(--mk))!important}
.mockType .tiktok-scene-copy span{font-size:calc(8px*var(--mk))!important}
.mockType .tiktok-rail>span{font-size:calc(20px*var(--mk))!important}
.mockType .tiktok-rail small{font-size:calc(7px*var(--mk))!important}
.mockType .tiktok-avatar{font-size:calc(12px*var(--mk))!important}
.mockType .tiktok-avatar i{font-size:calc(10px*var(--mk))!important}
.mockType .tiktok-caption strong{font-size:calc(10px*var(--mk))!important}
.mockType .tiktok-caption p{font-size:calc(8px*var(--mk))!important}
.mockType .tiktok-caption div,.mockType .tiktok-caption span{font-size:calc(7px*var(--mk))!important}
.mockType .tiktok-phone nav span{font-size:calc(13px*var(--mk))!important}
.mockType .tiktok-phone nav small{font-size:calc(6px*var(--mk))!important}
.mockType .tiktok-phone nav b{font-size:calc(17px*var(--mk))!important}
/* 小红书 / 抖音 / Instagram 增强（B 区私有类） */
.mockType .demoHeroCredit{font-size:calc(8px*var(--mk))!important}
.mockType .heroNote{font-size:calc(8px*var(--mk))!important}
.mockType .imagePlaceholder{font-size:calc(10px*var(--mk))!important}
.mockType .igHead strong{font-size:calc(17px*var(--mk))!important}
.mockType .igFollow{font-size:calc(9px*var(--mk))!important}
.mockType .igMetric{font-size:calc(9px*var(--mk))!important}
.mockType .igMetric svg{width:calc(18px*var(--mk))!important;height:calc(18px*var(--mk))!important}
.mockType .xhsStatus{font-size:calc(9px*var(--mk))!important}
.mockType .xhsHeader strong{font-size:calc(11px*var(--mk))!important}
.mockType .xhsAvatar{font-size:calc(11px*var(--mk))!important}
.mockType .xhsFollow{font-size:calc(10px*var(--mk))!important}
.mockType .xhsBody h3{font-size:calc(14px*var(--mk))!important}
.mockType .xhsBody p{font-size:calc(11px*var(--mk))!important}
.mockType .xhsHashtags{font-size:calc(10px*var(--mk))!important}
.mockType .xhsMeta{font-size:calc(8px*var(--mk))!important}
.mockType .xhsInput{font-size:calc(9px*var(--mk))!important}
.mockType .xhsDock button,.mockType .xhsDockCount{font-size:calc(9px*var(--mk))!important}
.mockType .commentHeading{font-size:calc(10px*var(--mk))!important}
.mockType .commentEmpty{font-size:calc(10px*var(--mk))!important}
.mockType .hotComment{font-size:calc(9.5px*var(--mk))!important}
.mockType .dyTitle{font-size:calc(15px*var(--mk))!important}
.mockType .dySub{font-size:calc(9px*var(--mk))!important}
.mockType .dyRailItem{font-size:calc(9px*var(--mk))!important}
.mockType .dyCaption{font-size:calc(10px*var(--mk))!important}
.mockType .dyCaption b{font-size:calc(11px*var(--mk))!important}
.mockType .dyCaption small{font-size:calc(9px*var(--mk))!important}
.mockType .shotTime{font-size:calc(10px*var(--mk))!important}
.mockType .shotMain strong{font-size:calc(10px*var(--mk))!important}
.mockType .shotText{font-size:calc(10px*var(--mk))!important}
.mockType .shotBgm{font-size:calc(9px*var(--mk))!important}
.mockType .demoTag{font-size:calc(8px*var(--mk))!important}
`;

export function ensureMockFontScaleStyle(): void {
  if (typeof document === "undefined") return;
  let style = document.getElementById(MOCK_FONT_SCALE_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = MOCK_FONT_SCALE_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = MOCK_FONT_SCALE_CSS;
}
