require "bundler/setup"
require "erb"
require "uglifier"
require "sproutcore"

LICENSE = File.read("generators/license.js")

module SproutCore
  module Compiler
    class Entry
      def body
        "\n(function(exports) {\n#{@raw_body}\n})({})\n"
      end
    end
  end
end

def strip_require(file)
  result = File.read(file)
  result.gsub!(%r{^\s*require\(['"]([^'"])*['"]\);?\s*$}, "")
  result
end

def strip_sc_assert(file)
  result = File.read(file)
  result.gsub!(%r{^(\s)+sc_assert\((.*)\).*$}, "")
  result
end

def uglify(file)
  uglified = Uglifier.compile(File.read(file))
  "#{LICENSE}\n#{uglified}"
end

SproutCore::Compiler.output = "tmp/static"
SproutCore::Compiler.intermediate = "tmp/sproutcore-routing"

def compile_routing_task
  js_tasks = SproutCore::Compiler::Preprocessors::JavaScriptTask.with_input "lib/**/*.js", "."
  SproutCore::Compiler::CombineTask.with_tasks js_tasks, "#{SproutCore::Compiler.intermediate}/sproutcore-routing"
end

task :compile_routing_task => compile_routing_task

task :build => [:compile_routing_task]

file "dist/sproutcore-routing.js" => :build do
  puts "Generating sproutcore-routing.js"
  
  mkdir_p "dist"
  
  File.open("dist/sproutcore-routing.js", "w") do |file|
    file.puts strip_require("tmp/static/sproutcore-routing.js")
  end
end

# Minify dist/sproutcore-routing.js to dist/sproutcore-routing.min.js
file "dist/sproutcore-routing.min.js" => "dist/sproutcore-routing.js" do
  puts "Generating sproutcore-routing.min.js"
  
  File.open("dist/sproutcore-routing.prod.js", "w") do |file|
    file.puts strip_sc_assert("dist/sproutcore-routing.js")
  end
  
  File.open("dist/sproutcore-routing.min.js", "w") do |file|
    file.puts uglify("dist/sproutcore-routing.prod.js")
  end
  rm "dist/sproutcore-routing.prod.js"
end

desc "Build SproutCore Routing"
task :dist => ["dist/sproutcore-routing.min.js"]

desc "Clean artifacts from pervious builds"
task :clean do
  sh "rm -rf tmp && rm -rf dist"
end

task :default => :dist