import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-list-to-json',
  standalone: true,
  imports: [Textarea, FormsModule, Button],
  templateUrl: './list-to-json.component.html',
})
export class ListToJsonComponent {
  inputText: string = '';
  jsonOutput: string = '';

  generateJson() {
    if (!this.inputText) {
      this.jsonOutput = '';
      return;
    }

    const lines = this.inputText.split('\n');
    const jsonArray: { title: string }[] = [];

    lines.forEach((line) => {
      // Trim leading/trailing whitespace AND non-alphanumeric characters from the start
      let title = line.trimStart();
      title = title.replace(/^[^a-zA-Z0-9]+/, ''); // Remove leading non-alphanumeric
      title = title.trimEnd();

      if (title) {
        jsonArray.push({ title: title });
      }
    });

    this.jsonOutput = JSON.stringify(jsonArray, null, 2);
  }
}
