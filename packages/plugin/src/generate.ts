import fs from 'fs'
import { remove } from 'fs-extra'
import { flatten, uniq } from 'lodash'
import path from 'path'
import { globWithGit } from 'smart-glob'
import { TESTING } from './constants'
import { generateExperiments } from './experiments'
import { VitroConfig } from './plugin'
import { makeExperimentsTree } from './tree'
import { debug, isWithin } from './support'

const excludedDirs = ['**/.vitro/**', '**/pages/experiments/**']

export const generate = async (
    args: VitroConfig & { experimentsFilters?: string[] },
) => {
    let {
        experiments = [],
        ignore: userIgnore = [],
        wrapper,
        cwd,
        experimentsFilters = [],
    } = args

    debug({experimentsFilters})
    experiments = experiments.map(path.normalize)
    const ignoreGlobs = [...userIgnore, ...excludedDirs]

    debug(`starting globWithGit`)
    const globsBase = path.resolve(path.join(cwd, '..'))
    // TODO filter results to only files under the filter path
    const results = await Promise.all(
        experiments.map((s) =>
            globWithGit(s, {
                ignoreGlobs,
                gitignore: true,
                absolute: false,
                cwd: globsBase,
                // filesOnly: true,
            }),
        ),
    )
    debug(`finished globWithGit`)
    // console.log(results)
    const files: string[] = uniq(flatten(results))
        .filter(Boolean)
        .filter((p) => {
            return (
                !experimentsFilters?.length ||
                experimentsFilters.some((f) =>
                    isWithin(f, path.join(globsBase, p)),
                )
            )
        })

    debug(`creating pages tree`)
    const experimentsTree = makeExperimentsTree(files)
    await fs.promises.writeFile(
        path.join(cwd, 'experimentsTree.json'),
        JSON.stringify(experimentsTree, null, 4),
    )
    debug(`created pages tree`)

    // TODO generate the index.js file with routes
    // const targetDir = path.resolve(path.join(cwd, './pages/experiments'))
    // await generateExperiments({
    //     files,
    //     wrapperComponentPath: wrapper,
    //     targetDir,
    // })
}
