require 'rubygems'
require 'bundler'

Bundler.require

def bundle(file) 
  content = File.read(file)
  content.gsub!(/\/\*\s*bundle\s+("|')(.+?)\1\s*\*\//) do |match|
    bundle($2).strip
  end
  content = YUICompressor.compress_css(content) if file =~ /\.css$/i
  content = YUICompressor.compress_js(content) if file =~ /\.js$/i
  content
end

task :bundle do
  File.open('remark.min.js', 'w') do |file|
    file.write(bundle('src/remark.js'))
  end
end

task :default => :bundle
