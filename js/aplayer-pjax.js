/* 固定式音樂播放器的 pjax 存活處理。
 *
 * 背景：主題 5.7.0 移除了內建的 aplayerInject，資源改由 _config.yml 的 inject 注入。
 *
 * 為什麼不能直接呼叫 loadMeting()：
 *   MetingJS 1.x 的 loadMeting() 一開頭就無條件跑
 *     for (i in aplayers) aplayers[i].destroy(); aplayers = []
 *   它不看 options.fixed，也不看 no-destroy class，所以每次呼叫都會把固定播放器
 *   一起銷毀重建 —— 音樂從頭播、還會重新抓一次整份歌單 JSON。
 *
 * 對策：
 *   1. 沒有「尚未初始化」的播放器時，完全不呼叫 loadMeting()（一般跳頁的情況）。
 *   2. 真的需要初始化新播放器時（例如進入 /music/），先把固定播放器從
 *      window.aplayers 移出、並暫時拿掉 aplayer class，讓 loadMeting 的銷毀迴圈
 *      與 querySelectorAll 掃描都看不到它，跑完再還原。
 *      這兩件事在 loadMeting() 內都是同步完成的，所以還原時機是安全的。
 */
(() => {
  const isFixed = p => !!(p && p.options && p.options.fixed)

  // APlayer 初始化後會在容器內建立 .aplayer-body，用它判斷是否已初始化
  const hasPending = () =>
    Array.from(document.querySelectorAll('.aplayer')).some(el => !el.querySelector('.aplayer-body'))

  const runMeting = () => {
    if (typeof loadMeting !== 'function' || !hasPending()) return

    const all = window.aplayers || []
    const fixed = all.filter(isFixed)
    const fixedEls = fixed.map(p => p.container).filter(Boolean)

    window.aplayers = all.filter(p => !isFixed(p))
    fixedEls.forEach(el => el.classList.remove('aplayer'))
    try {
      loadMeting()
    } finally {
      fixedEls.forEach(el => el.classList.add('aplayer'))
      window.aplayers = (window.aplayers || []).concat(fixed)
    }
  }

  // 離開頁面時只銷毀非固定的播放器（它們的 DOM 會隨 #body-wrap 一起被 pjax 換掉）
  const destroyNonFixed = () => {
    const all = window.aplayers || []
    all.forEach(p => {
      if (!isFixed(p)) {
        try { p.destroy() } catch (e) { /* 已被移除的容器，忽略 */ }
      }
    })
    window.aplayers = all.filter(isFixed)
  }

  btf.addGlobalFn('pjaxSend', destroyNonFixed, 'destroyAplayer')
  btf.addGlobalFn('pjaxComplete', runMeting, 'runMetingJS')
})()
