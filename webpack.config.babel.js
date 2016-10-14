import webpack from "webpack";
import path from "path";
const SOURCE = path.join(__dirname, "src");
const DESTINATION = path.join(__dirname, "dist");
const ENV = process.env.NODE_ENV;
const isDebug = ENV === "development";
const configuration = {
	context: __dirname,
	entry: {
		index: "./src"
	},
	output: {
		path: DESTINATION,
		publicPath: ".",
		filename: "[name].js",
		chunkFilename: "[name]-[chunkhash].js"
	},
	module: {
		loaders: [{
			test: SOURCE,
			loader: "babel-loader"
		}]
	},
	devtool: isDebug ? "inline-sourcemap" : false,
	plugins: isDebug ? [] : [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mangle: false,
			sourcemap: false
		})
	]
};
export default configuration;