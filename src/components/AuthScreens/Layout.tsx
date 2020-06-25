/*
 * Copyright (c) 2020 Squirrel Chat, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react'

import Logo from '@components/Icons/Logo'

import style from '@styles/auth/layout.scss'

export interface AuthScreenLayoutProps {
  children: React.ReactChild
}

const BACKGROUNDS = [
  {
    photo: '1534125981653-62348ecf8b92',
    photographer: 'Jeff Ma',
    username: 'jeffma'
  },
  {
    photo: '1536350065412-8458917aae5c',
    photographer: 'Julia Florczak',
    username: 'muustudio'
  },
  {
    photo: '1511497584788-876760111969',
    photographer: 'Sergei Akulich',
    username: 'sakulich'
  },
  {
    photo: '1445217143695-467124038776',
    photographer: 'Sergei Akulich',
    username: 'sakulich'
  },
  {
    photo: '1564898019051-10a5ac4acb67',
    photographer: 'Katerina Kerdi',
    username: 'katekerdi'
  }
]

const Layout = (props: AuthScreenLayoutProps) => {
  const background = React.useMemo(() => BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)], [])
  const [ w, h ] = React.useMemo(() => [
    Math.ceil(window.innerWidth * .7),
    Math.ceil(window.innerHeight * .7)
  ], [])
  const [ loaded, setLoaded ] = React.useState(false)

  return (
    <div className={style.layout}>
      <div className={style.header}>
        <Logo className={style.logo}/>
        <svg className={style.bg} xmlns='http://www.w3.org/2000/svg' viewBox='2 2 489.03 297.41'>
          <path d='M.5,294.5c12.15-34.33,34.66-79.68,79-110,116.29-79.51,268.8,22.3,358-55,22.44-19.44,47-55.57,51-129H.5Z'/>
        </svg>
      </div>
      <div className={style.container}>
        {props.children}
      </div>
      <div className={style.background}>
        <img
          src={`https://images.unsplash.com/photo-${background.photo}?w=${w}&h=${h}&auto=format&fit=crop&q=80&ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9`}
          style={{ opacity: Number(loaded) }}
          onLoad={() => setLoaded(true)}
          alt=''
        />
      </div>
      <span className={style.credits}>
        Photo by <a href={`https://unsplash.com/@${background.username}`} target='_blank' rel='noreferrer'>{background.photographer}</a> on <a href='https://unsplash.com/' target='_blank' rel='noreferrer'>Unsplash</a>
      </span>
    </div>
  )
}

Layout.displayName = 'AuthScreenLayout'
export default React.memo(Layout)
