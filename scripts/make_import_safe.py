import pandas as pd
import os

# 1. Định nghĩa đường dẫn file
input_path = 'docs/jira_tasks_import.csv' if os.path.exists('docs/jira_tasks_import.csv') else 'jira_tasks_import.csv'
output_path = 'import_safe.csv'
output_docs_path = 'docs/import_safe.csv'

print(f"[*] Đang đọc file từ: {input_path}")
df = pd.read_csv(input_path)

print(f"[*] Các cột ban đầu: {list(df.columns)}")

# 2. Xóa hoàn toàn 2 cột Sprint và Assignee (nếu có tồn tại)
cols_to_drop = [col for col in ['Sprint', 'Assignee'] if col in df.columns]
df_safe = df.drop(columns=cols_to_drop)

print(f"[*] Đã loại bỏ các cột: {cols_to_drop}")
print(f"[*] Các cột còn lại: {list(df_safe.columns)}")

# 3. Xuất ra file import_safe.csv (chuẩn mã hóa UTF-8 để không bị lỗi tiếng Việt)
df_safe.to_csv(output_path, index=False, encoding='utf-8-sig')
df_safe.to_csv(output_docs_path, index=False, encoding='utf-8-sig')
print(f"[+] Đã xuất file an toàn tại: {output_path} và {output_docs_path}")

# 4. In ra màn hình 5 dòng đầu tiên để kiểm tra
print("\n" + "="*80)
print("5 DÒNG ĐẦU TIÊN CỦA FILE IMPORT_SAFE.CSV:")
print("="*80)
print(df_safe.head())

