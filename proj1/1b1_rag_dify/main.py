def main():
    from upload_to_dify import upload_files_from_directory

    # Upload md files
    upload_files_from_directory("assets/mds", ".md")
    # Upload pdf files
    upload_files_from_directory("assets/pdfs", ".pdf")


if __name__ == "__main__":
    main()
