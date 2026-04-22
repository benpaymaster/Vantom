#!/usr/bin/env python3
"""
Simple Web Server for Vantom OS Demo
Since React Native has dependency issues, this serves our HTML mockup
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8081
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Vantom OS Demo Server Running")
        print(f"📱 Open your browser to: http://localhost:{PORT}")
        print(f"🎯 This shows the complete driver interface")
        print(f"📱 Mobile-responsive design included")
        print(f"🔄 Press Ctrl+C to stop server")
        
        # Auto-open browser
        webbrowser.open(f'http://localhost:{PORT}/frontend/Main_Dashboard_Mockup.html')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
