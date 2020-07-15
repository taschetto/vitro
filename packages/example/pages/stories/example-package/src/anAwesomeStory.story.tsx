import * as exported from '@/../example-package/src/anAwesomeStory.story'
import { default as GlobalWrapper } from '@/../example-package/src/Wrapper'
import React from 'react'
import { StoryPage } from '@vitro/ui/src'

const absolutePath = '/Users/morse/Documents/GitHub/react-comics/packages/example-package/src/anAwesomeStory.story.tsx'

export default function Page() {
    return (
        <StoryPage
            GlobalWrapper={GlobalWrapper}
            absolutePath={absolutePath}
            storyExports={exported}
        />
    )
}
