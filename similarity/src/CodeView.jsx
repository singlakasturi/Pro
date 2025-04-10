export default function CodeView() {
    const mockCode = `#include <iostream>
  using namespace std;
  int main() {
    int a, b; cin >> a >> b;
    cout << a + b << endl;
    return 0;
  }`;
  
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Submitted Code</h1>
        <pre className="bg-gray-900 text-green-300 p-4 rounded-xl overflow-auto">
          <code>{mockCode}</code>
        </pre>
      </div>
    );
  }
  