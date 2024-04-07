import express, { Request, Response } from 'express';
import { URL } from 'url';
import icons from './dist/icons.json';
import * as dotenv from "dotenv";
dotenv.config();

interface ShortNames {
  [key: string]: string;
}

const iconNameList: string[] = [
  ...new Set(Object.keys(icons).map(i => i.split('-')[0])),
];
const shortNames: ShortNames = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  tailwind: 'tailwindcss',
  vue: 'vuejs',
  nuxt: 'nuxtjs',
  go: 'golang',
  cf: 'cloudflare',
  wasm: 'webassembly',
  postgres: 'postgresql',
  k8s: 'kubernetes',
  next: 'nextjs',
  mongo: 'mongodb',
  md: 'markdown',
  ps: 'photoshop',
  ai: 'illustrator',
  pr: 'premiere',
  ae: 'aftereffects',
  scss: 'sass',
  sc: 'scala',
  net: 'dotnet',
  gatsbyjs: 'gatsby',
  gql: 'graphql',
  vlang: 'v',
  amazonwebservices: 'aws',
  bots: 'discordbots',
  express: 'expressjs',
  googlecloud: 'gcp',
  mui: 'materialui',
  windi: 'windicss',
  unreal: 'unrealengine',
  nest: 'nestjs',
  ktorio: 'ktor',
  pwsh: 'powershell',
  au: 'audition',
  rollup: 'rollupjs',
  rxjs: 'reactivex',
  rxjava: 'reactivex',
  ghactions: 'githubactions',
  sklearn: 'scikitlearn',
  ml5: 'ml5js',
  vb: 'visualbasic',
};

const themedIcons: string[] = [
  ...Object.keys(icons)
    .filter(i => i.includes('-light') || i.includes('-dark'))
    .map(i => i.split('-')[0]),
];

const app = express();
const PORT = process.env.PORT || 3000;

const ICONS_PER_LINE = 15;
const ICON_SIZE = 48;

const generateSvg = (
  iconNames: string[],
  perLine: number,
  iconSize: number = ICON_SIZE
): string => {
  const iconSvgList: any[] = iconNames.map(i => icons[i]);
  const length = Math.min(perLine * 300, iconNames.length * 300) - 44;
  const height = Math.ceil(iconSvgList.length / perLine) * 300 - 44;
  const SCALE = iconSize / (300 - 44);
  const scaledHeight = height * SCALE;
  const scaledWidth = length * SCALE;
  return `
  
    <svg width="${scaledWidth}" 
        height="${scaledHeight}" 
        viewBox="0 0 ${length} ${height}" 
        fill="none" xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
      ${iconSvgList
        .map(
          (i, index) =>
            `
              <g transform="translate(${(index % perLine) * 300}, ${
              Math.floor(index / perLine) * 300
            })">
                <title>${iconNames[index].split('-')[0]}</title>
                ${i}
              </g>
          `
        )
        .join(' ')}
    </svg>
  `;
};

const parseShortNames = (names: string[], theme = 'dark'): string[] => {
  return names.map(name => {
    if (iconNameList.includes(name))
      return name + (themedIcons.includes(name) ? `-${theme}` : '');
    else if (name in shortNames)
      return (
        shortNames[name] +
        (themedIcons.includes(shortNames[name]) ? `-${theme}` : '')
      );
    return '';
  });
};

app.get('/', (req: Request, res: Response) => {
  res.json('Hello');
});

app.get('/icons', (req: Request, res: Response) => {
  const { pathname, searchParams } = new URL(
    req.url!,
    `http://${req.headers.host}`
  );
  const path = pathname.replace(/^\/|\/$/g, '');
  if (path === 'icons') {
    const iconParam = searchParams.get('i') || searchParams.get('icons');
    if (!iconParam) {
      return res.status(400).send("You didn't specify any icons!");
    }
    const theme = searchParams.get('t') || searchParams.get('theme');
    if (theme != null && theme !== 'dark' && theme !== 'light') {
      return res.status(400).send('Theme must be either "light" or "dark"');
    }
    const perLineParam = searchParams.get('perline');
    const perLine: number = perLineParam
      ? parseInt(perLineParam, 10)
      : ICONS_PER_LINE;
    const sizeParam = searchParams.get('size');
    const iconSize: number = sizeParam ? parseInt(sizeParam, 10) : ICON_SIZE;
    if (theme != null && (isNaN(perLine) || perLine < 1 || perLine > 50)) {
      return res.status(400).send('perLine must be a number between 1 and 50');
    }
    let iconShortNames: any[] = [];
    if (iconParam === 'all') {
      iconShortNames = iconNameList;
    } else {
      iconShortNames = iconParam!.split(',');
      const sort: boolean = searchParams.get('sort') === 'true';
      if (sort === true) iconShortNames.sort();
    }

    const iconNames = parseShortNames(iconShortNames, theme ?? 'dark');
    if (!iconNames) {
      return res
        .status(400)
        .send("You didn't format the icons param correctly!");
    }
    const svg = generateSvg(iconNames, perLine, iconSize);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } else if (path === 'api/icons') {
    res.json(iconNameList);
  } else if (path === 'api/svgs') {
    const iconsData = iconNameList.map(name => {
      return generateSvg([name], 1);
    });
    res.json(iconsData);
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

export default app;
