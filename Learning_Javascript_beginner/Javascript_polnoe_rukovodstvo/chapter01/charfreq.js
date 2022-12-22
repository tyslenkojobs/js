/**
* Эта программа Node читает текст из стандартного ввода, рассчитывает
* частоту встречи каждой буквы в данном тексте и отображает гистограмму
* для наиболее часто используемых символов.
* Для выполнения требует версии Node 12 или новее.
*
* В среде Unix программу можно запустить следующим образом:
*
* node charfreq.js < corpus.txt
*/
// Этот класс расширяет класс Мар так, что метод get() возвращает вместо
// null указанное значение, когда ключ отсутствует в отображении.
class defaultMap extends Map{
    constructor (defaultValue) {
        super();                            //Вызвать конструктор суперкласса
        this.defaultValue = defaultValue;   //Запомнить стандартное значение
    }

    get(key) {
        if (this.has(key)) {        //Если ключ присутствует в отображении,
            return super.get(key);  //тогда возвратить его значение из суперкласса
        } 
        else {
            return this.defaultValue; //Иначе возвратить его стандартное значение
        }
    }
}

//Этот класс рассчитывает и выводит гистограмму частоты использования букв,
class Histogram {
    constructor() {
        this.letterCounts = new defaultMap(0); //Отображение букв на счетчике
        this.totalLetters = 0;                 //Общее колличество букв 
    }

    add(text) {
        //Удалять из текста проьбельные символы
        //и преобразовать оставшиеся в верхний регистр
        text = text.replace(/\s/g,"").toUpperCase();

        //Пройти в цикле по символам текста
        for(let character of text) {
            let count = this.letterCounts.get(character);   //Получить старый счетчик
            this.letterCounts.set(character, count+1);      //Инкрементировать его
            this.totalLetters++;
        }
    }


}

// Преобразовать гистограмму в строку, которая отображает графику ASCII
toString() {
    // Преобразовать Мар в массив массивов [ключ, значение]
    let entries = [...this.letterCounts];
    // Отсортировать массив по счетчикам, а затем в алфавитном порядке
    entries.sort((a,b) =>{                     //функция определения порядка сортировки
        if (a[1] === b[1]) {                    // Если счётчики одинаковые
            return a[0] < b[0] ? -1 : 1;        // тогда сортировать в алфавитном порядке
        } else {                                // Если счётчики отличаются 
            return b[1] - a[1];                 // тогда сортировать по наибольшему счётчику
        }
    });

    // Преобразовать счётчики в процентные отношения
    for(let entry of entries) {
        entry[1] = entry[1] / this.totalLetters * 100
    } 

    // Отбросить все записи с процентным значением меньше 1%
    entries = entries.filter(entry => entry[1] >=1);

    // Преобразовать каждую запись в строку текста
    let lines = entries.map(
        ([l,n]) => `${l}: ${"#".repeat(Math.round(n))} ${n.toFixed(2)}%`
    );

    // Возвратить сцепленные строки, разделенные символами новой строки
    return lines.join("\n");
}


//  Эта асинхронная (возвращающая Promise) функция создает объект Histogram,
//  читает асинхронным образом порции текста из стандартного ввода
//  и добавляет их к гистограмме.
//  Достигнув конца потока данных, функция возвращает итоговую гистограмму.

async function  histogramFromStdin() {
    process.stdin.setEncoding("utf8"); // Читать строки Unicode, не байты
    let histogram = new Histogram();
    for await (let chunk of process.stdin) {
            histogram.add(chunk);
        }
    return histogram;
}

// Эта финальная строка кода является главным телом программы.
// Она создает объект Histogram из стандартного ввода
// и затем выводит гистограмму.
histogramFromStdin().then(histogram => { console.log(histogram.toString()); });