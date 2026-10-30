(() => {
  const headings = '.post-content h1[id], .post-content h2[id], .post-content h3[id], .post-content h4[id], .post-content h5[id], .post-content h6[id]'

  function addCopyButtons() {
    document.querySelectorAll(headings).forEach((heading) => {
      if (heading.querySelector('.header-anchor-copy')) return

      const button = document.createElement('button')
      button.className = 'header-anchor-copy'
      button.type = 'button'
      button.title = '複製此標題的連結'
      button.setAttribute('aria-label', '複製此標題的連結')
      button.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>'

      button.addEventListener('click', async () => {
        const url = new URL(window.location.href)
        url.hash = heading.id

        try {
          await navigator.clipboard.writeText(url.href)
          button.classList.add('copied')
          button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>'
          button.title = '已複製標題連結'
          window.setTimeout(() => {
            button.classList.remove('copied')
            button.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>'
            button.title = '複製此標題的連結'
          }, 1200)
        } catch (error) {
          button.title = '無法複製連結，請使用瀏覽器複製功能'
        }
      })

      heading.append(button)
    })
  }

  addCopyButtons()
  new MutationObserver(addCopyButtons).observe(document.body, { childList: true, subtree: true })
})()
