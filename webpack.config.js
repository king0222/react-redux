var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var searchDir = ['src', 'public'];//need webpack packages directory
var entry = {};


var getFileList = function(dirs, option) {
    var pathArr = [];
    dirs.forEach(function(dir) {
      var loopDir = function(dir) {
          var paths = fs.readdirSync(dir);
          paths.forEach(function(pa) {
              var _src = dir + '/' + pa;
              var stat = fs.statSync(_src);
              if (!stat) {
                  console.log(('build::' + _src + '文件读取错误!').red);
                  return;
              } else {
                  if (stat.isFile()) {
                      if (option && option.include) {
                          if (option.include.includes(path.extname(_src))) {
                              pathArr.push(_src);
                          }
                      } else {
                        if (option && option.exclude) {
                          if (!option.exclude.includes(path.extname(_src))) {
                              pathArr.push(_src);
                          }
                        } else {
                            pathArr.push(_src);
                        }
                      }
                  } else if (stat.isDirectory()) {
                      // 当是目录是，递归复制
                      loopDir(_src);
                  }
              }
          });
      };
      loopDir(dir);
    });

    return pathArr;
};

var list = getFileList(searchDir, {exclude: ['.html', '.less']});

list.map(function(file) {
  entry[file.split('.')[0]] = path.join(__dirname, file);
});


Object.keys(entry).forEach(function(key) {
	entry[key] = ["webpack-dev-server/client?http://localhost:3009/", "webpack/hot/dev-server", entry[key]];
});

//上面的代码全是构造entry用的


entry = {
  './src/index': ["webpack-dev-server/client?http://localhost:3009/", "webpack/hot/dev-server", "./src/index.js"]
};
//一个项目or一个页面,只有一个js入口，所有的静态资源可以再这个入口文件中import导入
//在这里我们配置entry为数组形式是为了能够兼容各种项目结构开发，比如单页面项目和多页面项目
module.exports = {
	devtool: 'source-map',
	entry: entry,
	output: {
		path: path.join(__dirname, 'dist'), //这个配置用来生成保存文件的路径
		filename: '[name].[hash].js',
		publicPath: '/static/' //这个是用来生成缓存文件的路径，不需要加上上面配置的path路径,注意这个路径static后面一定要跟着斜杠哦，否则吼吼吼,另外这个东西跟后面生成的样式文件里面引用的图片路径也有关，看着配置就好了
	},
	plugins: [
		new ExtractTextPlugin('./style.css'), //这个地方要特别注意，取值不能像(/style.css)这样，这样会有问题，编译出来是访问不到这个样式文件的，可以改为(style.css)
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		function() {
			this.plugin('done', stats => {
				fs.readFile('./public/index.html', (err, data) => {
	          const $ = cheerio.load(data.toString());
	          $('script').attr('src', 'http://localhost:3009/static/src/index.'+stats.hash+'.js');
	          fs.writeFile('./public/index.html', $.html(), err => {
	              !err && console.log('Set has success: '+stats.hash)
	          })
	      })
			})
		}
	],
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			include: __dirname,
			query: {
				presets: ['es2015', 'stage-0', 'react']
			}
		}, 
		{
      test: /\.css$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader", "autoprefixer-loader")
    },
    {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader!autoprefixer-loader")
    },
    {
      test: /\.(png|jpg)$/,
      loader: 'url?limit=2000&name=[hash].[ext]'
    },
    {
      test: /\.(eot|woff|svg|ttf|woff2|gif)(\?|$)/,
      loader: 'file-loader?name=[hash].[ext]'
    }
    ]
	}
}