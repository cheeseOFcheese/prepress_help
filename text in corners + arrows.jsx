// Показываем диалоговое окно для выбора параметров
var dialog = new Window('dialog', 'Настройки текста');
dialog.orientation = 'column';
dialog.alignChildren = 'left';

var doc = app.activeDocument;
var artboardIndex = 0; // Индекс выбранного артборда по умолчанию
var textItems = []; // Список для хранения текстовых объектов

// Чекбокс и поле для ввода имени
var nameGroup = dialog.add('group');
var useFileNameCheckbox = nameGroup.add('checkbox', undefined, 'Использовать имя файла');
useFileNameCheckbox.value = true; // По умолчанию использовать имя файла
var nameInput = nameGroup.add('edittext', undefined, doc.name);
nameInput.enabled = false;

useFileNameCheckbox.onClick = function() {
    nameInput.enabled = !this.value;
    if (this.value) {
        nameInput.text = doc.name;
    }
};

// Создаем выпадающий список для выбора шрифта
var fontGroup = dialog.add('group');
fontGroup.add('statictext', undefined, 'Выберите шрифт:');
var fontDropdown = fontGroup.add('dropdownlist');
var fonts = app.textFonts; // Получаем доступные шрифты
var defaultFontIndex = 0; // Индекс шрифта Impact по умолчанию

// Заполняем выпадающий список именами шрифтов
for (var k = 0; k < fonts.length; k++) {
    var fontItem = fontDropdown.add('item', fonts[k].name);
    fontItem.font = fonts[k];
    if (fonts[k].name === "Impact") {
        defaultFontIndex = k; // Запоминаем позицию шрифта Impact
    }
}
fontDropdown.selection = defaultFontIndex; // Выбираем шрифт Impact по умолчанию

// Добавляем выпадающий список артбордов, только если их больше одного
if (doc.artboards.length > 1) {
    var artboardGroup = dialog.add('group');
    artboardGroup.add('statictext', undefined, 'Выберите артборд:');
    var artboardDropdown = artboardGroup.add('dropdownlist');
    for (var i = 0; i < doc.artboards.length; i++) {
        var item = artboardDropdown.add('item', doc.artboards[i].name);
        item.artboardIndex = i;
    }
    artboardDropdown.selection = 0; // По умолчанию выбираем первый артборд
    artboardDropdown.onChange = function() {
        artboardIndex = this.selection.artboardIndex;
    };
}

// Чекбокс для добавления стрелок
var arrowCheckbox = dialog.add('checkbox', undefined, 'Добавить стрелки');

// Создаем группу чекбоксов для выбора сторон
var sidesGroup = dialog.add('panel', undefined, 'Выберите позиции для текста:');
sidesGroup.orientation = 'column';
sidesGroup.alignChildren = 'left';
var topLeftCheckbox = sidesGroup.add('checkbox', undefined, 'Лево Верх');
var bottomLeftCheckbox = sidesGroup.add('checkbox', undefined, 'Лево Низ');
var topRightCheckbox = sidesGroup.add('checkbox', undefined, 'Право Верх');
var bottomRightCheckbox = sidesGroup.add('checkbox', undefined, 'Право Низ');

var sizeGroup = dialog.add('group');
sizeGroup.add('statictext', undefined, 'Введите размер шрифта (в миллиметрах):');
var sizeInput = sizeGroup.add('edittext', undefined, '4.23'); // Примерный размер в мм
sizeInput.characters = 5;

var buttonGroup = dialog.add('group');
var okButton = buttonGroup.add('button', undefined, 'OK');
var cancelButton = buttonGroup.add('button', undefined, 'Отмена');

okButton.onClick = function() {
    var fontSizeMm = parseFloat(sizeInput.text);
    var fontSizePt = fontSizeMm * 2.83465; // Конвертация мм в пункты
    var name = useFileNameCheckbox.value ? doc.name : nameInput.text; // Используем имя файла или введенное имя

    // Установка активного артборда
    doc.artboards.setActiveArtboardIndex(artboardIndex);

    // Обрабатываем каждый выбранный чекбокс
    if (topLeftCheckbox.value) {
        textItems.push(createTextAtCorner('topLeft', fontSizePt, doc.artboards[artboardIndex].artboardRect, name));
    }
    if (bottomLeftCheckbox.value) {
        textItems.push(createTextAtCorner('bottomLeft', fontSizePt, doc.artboards[artboardIndex].artboardRect, name));
    }
    if (topRightCheckbox.value) {
        textItems.push(createTextAtCorner('topRight', fontSizePt, doc.artboards[artboardIndex].artboardRect, name));
    }
    if (bottomRightCheckbox.value) {
        textItems.push(createTextAtCorner('bottomRight', fontSizePt, doc.artboards[artboardIndex].artboardRect, name));
    }

    // Создаем группу и добавляем все текстовые объекты в нее
    var group = doc.groupItems.add();
    group.name = "text_artboard";
    for (var j = 0; j < textItems.length; j++) {
        textItems[j].move(group, ElementPlacement.INSIDE);
    }

    dialog.close();
};

cancelButton.onClick = function() {
    dialog.close();
};

dialog.show();

// Функция для создания и перемещения текста
function createTextAtCorner(corner, fontSizePt, bounds, name) {
    var text = doc.textFrames.add();
    text.textRange.characterAttributes.textFont = fontDropdown.selection.font; // Установка выбранного шрифта
    var arrow = arrowCheckbox.value ? " ↑ " : "";
    switch (corner) {
        case 'topLeft':
            text.contents = arrow + "   " + name; // Добавляем стрелку перед текстом
            text.left = bounds[0];
            text.top = bounds[1] - text.height;
            break;
        case 'bottomLeft':
            text.contents = arrow + "   " + name; // Добавляем стрелку перед текстом
            text.left = bounds[0];
            text.top = bounds[3];
            break;
        case 'topRight':
            text.contents = name + "   " + arrow; // Добавляем стрелку после текста
            text.left = bounds[2] - text.width;
            text.top = bounds[1] - text.height;
            break;
        case 'bottomRight':
            text.contents = name + "   " + arrow; // Добавляем стрелку после текста
            text.left = bounds[2] - text.width;
            text.top = bounds[3];
            break;
    }
    text.position = [text.left, text.top];
    // Перемещаем текст на высоту самого текста вверх
    text.top += text.height;

    return text; // Возвращаем текстовый объект для добавления в группу
}
