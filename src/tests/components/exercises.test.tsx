import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChoiceEx } from '@/components/exercises/ChoiceEx'
import { WordBankEx } from '@/components/exercises/WordBankEx'
import { ToneEx } from '@/components/exercises/ToneEx'

describe('ChoiceEx', () => {
  it('рендерит вопрос и варианты, выбирает по клику', async () => {
    const onChange = vi.fn()
    const ex = {
      kind: 'choice' as const,
      prompt: 'Выбери перевод: «привет»',
      options: ['hello', 'bye', 'no'],
      answer: 'hello'
    }
    render(<ChoiceEx ex={ex} lang="en" value={null} onChange={onChange} locked={false} seed={1} ttsRate={1} />)

    expect(screen.getByText(/выбери перевод/i)).toBeInTheDocument()
    const helloBtn = screen.getByRole('button', { name: /hello/ })
    await userEvent.click(helloBtn)
    expect(onChange).toHaveBeenCalledWith('hello')
  })

  it('после блокировки клики отключены', async () => {
    const onChange = vi.fn()
    const ex = {
      kind: 'choice' as const,
      prompt: 'Q',
      options: ['one', 'two', 'three'],
      answer: 'one'
    }
    render(<ChoiceEx ex={ex} lang="en" value="one" onChange={onChange} locked={true} seed={1} ttsRate={1} />)
    const btn = screen.getByRole('button', { name: /two/ })
    expect(btn).toBeDisabled()
  })
})

describe('WordBankEx', () => {
  it('собирает фразу из плиток и снимает выбор повторным кликом', async () => {
    const onChange = vi.fn()
    const ex = {
      kind: 'wordbank' as const,
      prompt: 'Составь фразу: «я Анна»',
      words: ['I', 'am', 'Anna', 'cat'],
      answer: 'I am Anna.'
    }
    render(<WordBankEx ex={ex} lang="en" value={null} onChange={onChange} locked={false} seed={3} ttsRate={1} />)

    await userEvent.click(screen.getByRole('button', { name: 'I' }))
    await userEvent.click(screen.getByRole('button', { name: 'am' }))
    await userEvent.click(screen.getByRole('button', { name: 'Anna' }))
    expect(onChange).toHaveBeenLastCalledWith(['I', 'am', 'Anna'])

    await userEvent.click(screen.getByRole('button', { name: 'am' }))
    expect(onChange).toHaveBeenLastCalledWith(['I', 'Anna'])
  })

  it('плитка исчезает из банка после выбора', async () => {
    const ex = {
      kind: 'wordbank' as const,
      prompt: 'P',
      words: ['Water', 'bread'],
      answer: 'Water.'
    }
    render(<WordBankEx ex={ex} lang="en" value={null} onChange={() => {}} locked={false} seed={5} ttsRate={1} />)
    await userEvent.click(screen.getByRole('button', { name: 'Water' }))
    expect(screen.getAllByRole('button').filter((b) => b.textContent === 'Water')).toHaveLength(1)
  })
})

describe('ToneEx', () => {
  it('показывает слог и регистрирует ответ', async () => {
    const onChange = vi.fn()
    const ex = {
      kind: 'tone' as const,
      syllable: 'hǎo',
      word: '好',
      ru: 'хороший',
      options: ['1 · высокий ровный (ā)', '2 · восходящий (á)', '3 · нисходяще-восходящий (ǎ)', '4 · нисходящий (à)'],
      answer: '3 · нисходяще-восходящий (ǎ)'
    }
    render(<ToneEx ex={ex} lang="zh" value={null} onChange={onChange} locked={false} seed={7} ttsRate={1} />)

    expect(screen.getByText('好')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /нисходяще-восходящий/ }))
    expect(onChange).toHaveBeenCalledWith(ex.answer)
  })
})
