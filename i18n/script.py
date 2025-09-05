import pandas as pd
import os
import json

# Đường dẫn file Excel
EXCEL_FILE = "./localization.xlsx"

# Đường dẫn thư mục lưu trữ file JSON
OUTPUT_DIR = "./messsages/"

# Đọc dữ liệu từ Excel
def load_excel(file_path):
    return pd.read_excel(file_path, header=0) 

# Hàm tạo cấu trúc JSON lồng nhau
def create_nested_dict(keys, value):
    d = value
    for key in reversed(keys):
        d = {key: d}
    return d

# Hợp nhất hai dict
def merge_dict(d1, d2):
    for key, value in d2.items():
        if key in d1 and isinstance(d1[key], dict) and isinstance(value, dict):
            merge_dict(d1[key], value)
        else:
            d1[key] = value

# Chuyển đổi dữ liệu Excel thành JSON
def generate_json(data, lang):
    result = {}
    for _, row in data.iterrows():
        keys = row['code'].split('.')  # Phân tách key theo dấu "."
        value = row[lang]  # Lấy giá trị theo ngôn ngữ
        nested_dict = create_nested_dict(keys, value)
        merge_dict(result, nested_dict)
    return result

# Xuất file JSON
def export_json(data, lang):
    file_path = os.path.join(OUTPUT_DIR, f"{lang}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Exported {lang}.json")

# Hàm chính
def main():
    # Đảm bảo thư mục tồn tại
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Đọc dữ liệu từ file Excel
    data = load_excel(EXCEL_FILE)

    # Xử lý và tạo file JSON cho từng ngôn ngữ
    for lang in ['en', 'vi']:
        json_data = generate_json(data, lang)
        export_json(json_data, lang)

    print("Translations generated successfully!")

if __name__ == "__main__":
    main()