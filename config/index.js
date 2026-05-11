import {resolve} from 'path';

// Make @tailwindcss/node resolve 'tailwindcss' CSS imports to v4 (not root v3)
// @tailwindcss/node uses enhanced-resolve with mainFields:['style'], and
// tailwindcss v3 has no 'style' field in its package.json, causing resolution failure.
// tailwindcss v4 (bundled with @tailwindcss/postcss) has style: "index.css".
const twV4Index = resolve(__dirname, '..',
    'node_modules', '@tailwindcss', 'postcss', 'node_modules', 'tailwindcss', 'index.css');
globalThis.__tw_resolve = (specifier) => {
  if (specifier === 'tailwindcss' || specifier.startsWith('tailwindcss/')) {
    return require('fs').existsSync(twV4Index) ? twV4Index : null;
  }
  return null;
};

// Custom webpack plugin to clean up remaining Tailwind CSS v4 directives from WXSS
// Must run in processAssets (in-memory) to avoid infinite watch recompilation
class WXSSSanitizerPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('WXSSSanitizerPlugin', (compilation) => {
      compilation.hooks.processAssets.tap({
        name: 'WXSSSanitizerPlugin',
        // Run AFTER weapp-tailwindcss (stage 1000 = SUMMARIZE)
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH,
      }, (assets) => {
        Object.keys(assets).forEach(assetName => {
          if (!assetName.endsWith('.wxss') && !assetName.endsWith('.css')) return;
          let source = assets[assetName].source();
          const original = source;
          ['@supports', '@tailwind', '@theme'].forEach(keyword => {
            let idx = source.indexOf(keyword);
            while (idx !== -1) {
              // Find the matching closing brace for blocks like @supports (condition) { ... }
              let depth = 0, endIdx = idx;
              let hasOpeningBrace = false;
              for (let i = idx; i < source.length; i++) {
                if (source[i] === '{') {
                  depth++;
                  hasOpeningBrace = true;
                }
                if (source[i] === '}') depth--;
                // Only stop when depth returns to 0 AFTER we've seen at least one {
                if (depth === 0 && i > idx && hasOpeningBrace) {
                  endIdx = i + 1;
                  break;
                }
              }
              // If no brace block was found (e.g. @tailwind utilities;), remove to end of line
              if (!hasOpeningBrace) {
                const eol = source.indexOf('\n', idx);
                endIdx = eol !== -1 ? eol + 1 : source.length;
              }
              source = source.slice(0, idx) + source.slice(endIdx);
              idx = source.indexOf(keyword);
            }
          });
          if (source !== original) {
            assets[assetName] = new compiler.webpack.sources.RawSource(source);
          }
        });
      });
    });
  }
}

const config = {
  projectName: 'eden-taro',
  date: '2026-05-09',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist-weapp',
  plugins: ['@tarojs/plugin-html', '@tarojs/plugin-framework-react'],
  defineConstants: {},
  framework: 'react',
  compiler: 'webpack5',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {selectorBlackList: ['body']}
      },
      url: {enable: true, config: {limit: 1024}},
      cssModules: {enable: false, config: {generateScopedName: '[name]__[local]___[hash:base64:5]'}}
    },
    webpackChain(chain, webpack) {
      // Inject @tailwindcss/postcss into Taro's PostCSS pipeline
      const cssRuleNames = ['normalCss', 'sass', 'scss', 'less', 'stylus'];
      cssRuleNames.forEach(ruleName => {
        const rule = chain.module.rules.get(ruleName);
        if (!rule || !rule.oneOfs) return;
        rule.oneOfs.store.forEach((oneOf) => {
          if (!oneOf.uses) return;
          oneOf.uses.store.forEach((use) => {
            const entries = use.entries();
            if (entries.loader && entries.loader.includes('postcss-loader')) {
              use.tap(options => {
                options.postcssOptions.plugins = [
                  require('@tailwindcss/postcss'),
                  ...options.postcssOptions.plugins
                ];
                return options;
              });
            }
          });
        });
      });

      // Add WXSS sanitizer to strip unsupported Tailwind directives
      chain.plugin('wxss-sanitizer').use(WXSSSanitizerPlugin);

      // weapp-tailwindcss setup
      const UnifiedWebpackPluginV5 = require('weapp-tailwindcss/webpack').UnifiedWebpackPluginV5
      chain.plugin('weapp-tw').use(UnifiedWebpackPluginV5, [{
        cssEntries: [resolve(__dirname, '..', 'src', 'index.css')]
      }])

      // Prevent watch mode loops: stop webpack from watching its own output
      const {WatchIgnorePlugin} = require('webpack');
      chain.plugin('watch-ignore').use(WatchIgnorePlugin, [{
        paths: [resolve(__dirname, '..', 'dist-weapp')]
      }]);

      // Resolve @ alias to project root
      chain.resolve.alias.set('@', resolve(__dirname, '..'));
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {enable: true, config: {}},
      cssModules: {enable: true, config: {generateScopedName: '[name]__[local]___[hash:base64:5]'}}
    },
    webpackChain(chain) {
      // Target ES2017 for H5 so Module Federation remote entry's async/await doesn't warn
      chain.target(['web', 'es2017']);

      // Inject @tailwindcss/postcss into Taro's H5 PostCSS pipeline.
      // H5 has a dedicated 'postcss' rule (unlike mini where postcss-loader
      // is embedded inside the CSS/SCSS/LESS rules' oneOfs)
      const postcssRule = chain.module.rules.get('postcss');
      if (postcssRule) {
        postcssRule.uses.store.forEach((use) => {
          const entries = use.entries();
          if (entries.loader && entries.loader.includes('postcss-loader')) {
            use.tap(options => {
              options.postcssOptions.plugins = [
                require('@tailwindcss/postcss'),
                ...options.postcssOptions.plugins
              ];
              return options;
            });
          }
        });
      }
      // Prevent watch mode loops from @tailwindcss/postcss scanner detecting
      // output directory changes
      const {WatchIgnorePlugin} = require('webpack');
      chain.plugin('watch-ignore').use(WatchIgnorePlugin, [{
        paths: [resolve(__dirname, '..', 'dist-weapp')]
      }]);

      // Resolve @ alias to project root
      chain.resolve.alias.set('@', resolve(__dirname, '..'));
    }
  }
}
export default function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev.js'))
  }
  return merge({}, config, require('./prod.js'))
}
