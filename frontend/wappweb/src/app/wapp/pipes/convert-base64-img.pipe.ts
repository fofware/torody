import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertBase64Img',
  standalone: true
})
export class ConvertBase64ImgPipe implements PipeTransform {

  /*
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
  */
  public transform(value: any, contentType: string): any {
    const base64Content = `data:${contentType};base64,${value}`;
    return base64Content;
  }
}
